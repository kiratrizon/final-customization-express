import EloquentBuilder from "../../../main/database/Manager/EloquentBuilder.mjs";
import QueryBuilder from "../../../main/database/Manager/QueryBuilder.mjs";
import ConstructorModel from "./ConstructorModel.mjs";

/**
 * BaseModel provides core ORM-like functionalities for interacting with the database.
 * It offers static methods to build queries, retrieve data, and perform basic CRUD operations.
 */
export default class BaseModel extends ConstructorModel {
  /**
   * Creates a new record in the database using the provided data.
   * @param data - The data to insert.
   * @returns The created record.
   */
  static create(data: object): Promise<any>;

  /**
   * Finds a single record by its primary key.
   * @param id - The identifier of the record to find.
   * @returns The found record or null if not found.
   */
  static find(id: number | string): Promise<any>;

  /**
   * Finds a single record by its primary key, or throws an exception if not found.
   * @param id - The identifier of the record to find.
   * @throws Will throw an error if the record is not found.
   * @returns The found record.
   */
  static findOrFail(id: number | string): Promise<any>;

  /**
   * Retrieves all records from the database.
   * @returns A collection of all records.
   */
  static all(): Promise<any[]>;

  /**
   * Retrieves the first record that matches the provided condition.
   * @param column - The column to filter by.
   * @param value - The value to match for the column.
   * @returns The first matched record or null if none found.
   */
  static whereFirst(column: string, value: any): Promise<any>;

  /**
   * Adds a WHERE condition to the query.
   * @param args - The column, operator, and value for the WHERE condition.
   * @returns The query builder instance.
   */
  static where(...args: any[]): QueryBuilder;

  /**
   * Adds a WHERE IN condition to the query.
   * @param args - The column and values for the WHERE IN condition.
   * @returns The query builder instance.
   */
  static whereIn(...args: any[]): QueryBuilder;

  /**
   * Adds a WHERE NOT IN condition to the query.
   * @param args - The column and values for the WHERE NOT IN condition.
   * @returns The query builder instance.
   */
  static whereNotIn(...args: any[]): QueryBuilder;

  /**
   * Adds a WHERE NULL condition to the query.
   * @param column - The column to check for NULL.
   * @returns The query builder instance.
   */
  static whereNull(column: string): QueryBuilder;

  /**
   * Adds a WHERE NOT NULL condition to the query.
   * @param column - The column to check for NOT NULL.
   * @returns The query builder instance.
   */
  static whereNotNull(column: string): QueryBuilder;

  /**
   * Adds a WHERE BETWEEN condition to the query.
   * @param column - The column to check the range for.
   * @param values - The array containing the start and end values for the range.
   * @returns The query builder instance.
   */
  static whereBetween(column: string, values: [any, any]): QueryBuilder;

  /**
   * Adds a WHERE NOT BETWEEN condition to the query.
   * @param column - The column to check the range for.
   * @param values - The array containing the start and end values for the range.
   * @returns The query builder instance.
   */
  static whereNotBetween(column: string, values: [any, any]): QueryBuilder;

  /**
   * Creates a new query builder instance.
   * @returns The query builder instance.
   */
  static query(): QueryBuilder;

  /**
   * Specifies the columns to select in the query.
   * @param args - The columns to select.
   * @returns The query builder instance.
   */
  static select(...args: string[]): QueryBuilder;

  /**
   * Inserts data into the database.
   * @param data - The data to insert.
   * @returns The inserted record.
   */
  static insert(data: object[]): Promise<any>;

  /**
   * Retrieves the first record from the query.
   * @returns The first record from the query.
   */
  static first(): Promise<any>;

  /**
   * Orders the query results by a column.
   * @param key - The column to order by.
   * @param direction - The sorting direction (ASC or DESC).
   * @returns The query builder instance.
   */
  static orderBy(key: string, direction?: "ASC" | "DESC"): QueryBuilder;

  /**
   * Updates an existing record by its primary key.
   * @param id - The identifier of the record to update.
   * @param data - The data to update the record with.
   * @returns The number of affected rows.
   */
  static update(id: number | string, data: object): Promise<any>;
}
