// types/DatabaseManager.d.ts

/**
 * Provides a unified interface to interact with different SQL databases
 * such as MySQL, SQLite, and PostgreSQL.
 */
declare class DatabaseManager {
  /**
   * Constructs a new instance of DatabaseManager and selects the appropriate DB driver.
   */
  constructor();

  /**
   * Runs a raw SQL query and returns the result.
   * Meant for CLI or internal use — not for HTTP lifecycle.
   * Supports PostgreSQL's `$1`, `$2`, ... parameter replacement.
   *
   * @param sql The SQL query string.
   * @param params Optional parameters to bind in the query.
   */
  runQuery(sql?: string, params?: any[]): Promise<any>;

  /**
   * Executes a query without returning the result.
   * Ideal for insert/update/delete operations without needing a response.
   *
   * @param sql The SQL string to run.
   * @param params Optional parameters for the query.
   */
  runQueryNoReturn(sql: string, params?: any[]): Promise<void>;

  /**
   * Handles database migration application or rollback.
   * Automatically records applied migrations to prevent duplication.
   *
   * @param query SQL to execute for the migration.
   * @param filename Unique identifier of the migration file.
   * @param rollback If true, will roll back instead of applying.
   */
  makeMigration(
    query: string,
    filename: string,
    rollback?: boolean
  ): Promise<boolean>;

  /**
   * Initializes the database connection if not yet set.
   * Called internally before executing queries.
   */
  init(): void;

  /**
   * Escapes a value to safely use in a SQL statement.
   *
   * @param value The raw value to escape.
   * @returns Escaped SQL string.
   */
  escape(value: any): string;

  /**
   * Returns a formatted SQL query with parameters inlined, for debugging purposes.
   *
   * @param query Raw SQL with `?` placeholders.
   * @param params Values to replace the placeholders.
   */
  getQueryTrace(query: string, params?: any[]): string;

  /**
   * Closes the database connection.
   * Should be called when the application is shutting down.
   */
  close(): Promise<boolean>;
}

export = DatabaseManager;
