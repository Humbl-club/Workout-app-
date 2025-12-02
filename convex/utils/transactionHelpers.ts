/**
 * Transaction Safety Helpers
 *
 * Utilities for handling multi-step database operations with rollback support.
 * Convex doesn't have traditional transactions, but we can implement rollback logic.
 */

import type { Id } from "../_generated/dataModel";
import type { GenericDatabaseWriter } from "convex/server";

/**
 * Track operations for potential rollback
 */
export class TransactionTracker {
  private insertedIds: Array<{ table: string; id: Id<any> }> = [];
  private patchedRecords: Array<{ table: string; id: Id<any>; original: any }> = [];

  /**
   * Track an insert operation
   */
  trackInsert(table: string, id: Id<any>) {
    this.insertedIds.push({ table, id });
  }

  /**
   * Track a patch/update operation
   */
  trackUpdate(table: string, id: Id<any>, originalData: any) {
    this.patchedRecords.push({ table, id, original: originalData });
  }

  /**
   * Alias for trackUpdate (for consistency)
   */
  trackPatch(table: string, id: Id<any>, originalData: any) {
    this.trackUpdate(table, id, originalData);
  }

  /**
   * Rollback all tracked operations
   */
  async rollback(db: GenericDatabaseWriter<any>) {
    const errors: string[] = [];

    // Rollback in reverse order (LIFO)
    for (let i = this.insertedIds.length - 1; i >= 0; i--) {
      try {
        await db.delete(this.insertedIds[i].id);
      } catch (err) {
        errors.push(`Failed to rollback insert on ${this.insertedIds[i].table}: ${err}`);
      }
    }

    for (let i = this.patchedRecords.length - 1; i >= 0; i--) {
      try {
        await db.patch(this.patchedRecords[i].id, this.patchedRecords[i].original);
      } catch (err) {
        errors.push(`Failed to rollback patch on ${this.patchedRecords[i].table}: ${err}`);
      }
    }

    if (errors.length > 0) {
      console.error("Rollback errors:", errors);
    }
  }

  /**
   * Clear all tracked operations (call after successful commit)
   */
  clear() {
    this.insertedIds = [];
    this.patchedRecords = [];
  }
}

/**
 * Execute a multi-step operation with automatic rollback on failure
 */
export async function executeWithRollback<T>(
  db: GenericDatabaseWriter<any>,
  operation: (tracker: TransactionTracker) => Promise<T>
): Promise<T> {
  const tracker = new TransactionTracker();

  try {
    const result = await operation(tracker);
    tracker.clear(); // Success - no need to keep track
    return result;
  } catch (error) {
    console.error("Transaction failed, rolling back:", error);
    await tracker.rollback(db);
    throw error; // Re-throw after rollback
  }
}
