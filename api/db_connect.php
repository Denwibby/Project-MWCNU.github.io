<?php
/**
 * Database Connection Helper
 * Migrated from Supabase to MySQL
 */

require_once __DIR__ . '/config.php';

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        $dsn = sprintf(
            "mysql:host=%s;dbname=%s;charset=%s",
            DB_HOST,
            DB_NAME,
            DB_CHARSET
        );
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        try {
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            jsonError("Database connection failed", 500);
        }
    }
    
    /**
     * Get singleton instance of Database
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Get the PDO connection
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Execute a SELECT query
     */
    public function select($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Select error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Execute an INSERT query
     */
    public function insert($table, $data) {
        $columns = array_keys($data);
        $placeholders = array_map(function($col) { return ":$col"; }, $columns);
        
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $table,
            implode(', ', $columns),
            implode(', ', $placeholders)
        );
        
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($data);
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log("Insert error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Execute an UPDATE query
     */
    public function update($table, $data, $where, $whereParams = []) {
        $set = array_map(function($col) { return "$col = :$col"; }, array_keys($data));
        
        $sql = sprintf(
            "UPDATE %s SET %s WHERE %s",
            $table,
            implode(', ', $set),
            $where
        );
        
        $params = array_merge($data, $whereParams);
        
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Update error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Execute a DELETE query
     */
    public function delete($table, $where, $params = []) {
        $sql = sprintf("DELETE FROM %s WHERE %s", $table, $where);
        
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Delete error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Get a single row
     */
    public function get($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }
    
    /**
     * Count rows
     */
    public function count($table, $where = '1=1', $params = []) {
        $sql = sprintf("SELECT COUNT(*) as total FROM %s WHERE %s", $table, $where);
        $result = $this->get($sql, $params);
        return $result ? (int)$result['total'] : 0;
    }
}

/**
 * Helper function to get database instance
 */
function getDb() {
    return Database::getInstance();
}
