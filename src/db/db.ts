import defItems from "./db_def.json";
import type { ItemType, TripType } from "./db_facade";

type GenericType = {
  id: number;
  name: string;
  category_id: number;
  trip_id: number;
  item_id: number;
  trash: boolean;
};

export type CategoryType = {
  id: number;
  name: string;
};

export const TABLE_ITEMS = "items";
export const TABLE_CATEGORIES = "categories";
export const TABLE_TRIPS = "trips";
export const TABLE_TRIPS_AND_ITEMS = "trips_and_items";
type TABLES =
  | typeof TABLE_ITEMS
  | typeof TABLE_CATEGORIES
  | typeof TABLE_TRIPS
  | typeof TABLE_TRIPS_AND_ITEMS;

class DataBase {
  static readonly DATABASE_VER = 1;
  static readonly DATABASE_NAME = "backpack";

  private db?: IDBDatabase;

  protected async open() {
    return new Promise<void>((resolve, reject) => {
      const dbOpenRequest = window.indexedDB.open(
        DataBase.DATABASE_NAME,
        DataBase.DATABASE_VER
      );
      dbOpenRequest.onerror = (event) => {
        reject(event);
      };
      dbOpenRequest.onsuccess = async () => {
        this.db = dbOpenRequest.result;
        if ((await this.countTable(TABLE_CATEGORIES)) === 0) {
          await this.initDefaults();
          await this.initDefaultTrip();
          await this.initDefaultTrip2();
        }
        resolve();
      };
      dbOpenRequest.onupgradeneeded = (event) => {
        this.createTables(event);
      };
    });
  }

  // ----- PUBLIC -----
  public async getRecord(table: TABLES, id: number) {
    return new Promise<GenericType>((resolve, reject) => {
      if (!this.db) {
        reject("Database is NULL");
        return;
      }
      const transaction = this.db.transaction([table], "readonly");
      const store = transaction.objectStore(table);
      const query = store.get(id);

      query.onsuccess = () => {
        resolve(query.result);
      };
      query.onerror = (event) => {
        event.stopPropagation();
        reject(event);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  public async getRecords(
    table: TABLES,
    conditionFunction: (item: object) => boolean
  ) {
    return new Promise<Array<object>>((resolve, reject) => {
      if (!this.db) {
        reject("Database is NULL");
        return;
      }
      const transaction = this.db.transaction([table], "readonly");
      const store = transaction.objectStore(table);
      const cursorRequest = store.openCursor();
      const result: Array<object> = [];
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          if (conditionFunction(cursor.value)) result.push(cursor.value);
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      cursorRequest.onerror = (event) => {
        event.stopPropagation();
        reject(event);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  public async getTable(table: TABLES) {
    return new Promise<Array<GenericType>>((resolve, reject) => {
      if (!this.db) {
        reject("Database is NULL");
        return;
      }
      const transaction = this.db.transaction([table], "readonly");
      const store = transaction.objectStore(table);
      const query = store.getAll();

      query.onsuccess = () => {
        resolve(query.result);
      };
      query.onerror = (event) => {
        event.stopPropagation();
        reject(event);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  public addRecord(table: TABLES, record: object) {
    return new Promise<number>((resolve, reject) => {
      if (!this.db) {
        reject("Database is NULL");
        return;
      }
      const transaction = this.db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      const query = store.add(record);

      query.onsuccess = () => {
        resolve(Number(query.result));
      };
      query.onerror = (event) => {
        event.stopPropagation();
        reject(event);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  public updateRecord(table: TABLES, record: object) {
    return new Promise<number>((resolve, reject) => {
      if (!this.db) {
        reject("Database is NULL");
        return;
      }
      const transaction = this.db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      const query = store.put(record);

      query.onsuccess = () => {
        resolve(Number(query.result));
      };
      query.onerror = (event) => {
        event.stopPropagation();
        reject(event);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  public async addRecords(table: TABLES, items: Array<object>) {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.db) {
        reject("Database is NUll");
        return;
      }
      const transaction = this.db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);

      items.forEach((item) => {
        const query = store.add(item);

        query.onerror = (event) => {
          event.stopPropagation();
          reject(event);
        };
      });

      transaction.onerror = (event) => {
        reject(event);
      };

      resolve();
    });
  }

  // ----- PRIVATE -----
  private createTables(event: IDBVersionChangeEvent) {
    const db = (event.target as IDBOpenDBRequest).result;
    console.log(`Upgrading to version ${db.version}`);

    db.onerror = (event) => {
      console.error("Error initializing database", event);
    };

    const tripsTable = db.createObjectStore(TABLE_TRIPS, {
      keyPath: "id",
      autoIncrement: true,
    });
    tripsTable.createIndex("name", "name", { unique: false });
    tripsTable.createIndex("trash", "trash", { unique: false });

    const categoriesTable = db.createObjectStore(TABLE_CATEGORIES, {
      keyPath: "id",
      autoIncrement: true,
    });
    categoriesTable.createIndex("name", "name", { unique: true });

    const tripsAndItemsTable = db.createObjectStore(TABLE_TRIPS_AND_ITEMS, {
      keyPath: "id",
      autoIncrement: true,
    });
    tripsAndItemsTable.createIndex("trip_id", "trip_id", { unique: false });
    tripsAndItemsTable.createIndex("item_id", "item_id", { unique: false });
    tripsAndItemsTable.createIndex("packed", "packed", { unique: false });
    tripsAndItemsTable.createIndex("enabled", "enabled", { unique: true });

    const itemsTable = db.createObjectStore(TABLE_ITEMS, {
      keyPath: "id",
      autoIncrement: true,
    });
    itemsTable.createIndex("category_id", "category_id", { unique: false });
    itemsTable.createIndex("name", "name", { unique: true });
  }

  private async initDefaults() {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.db) {
        reject("Database is NULL");
        return;
      }
      await this.initDefaultCategories();

      const categoriesDB: Array<CategoryType> = await this.getTable(
        TABLE_CATEGORIES
      );
      const categories = new Map();

      categoriesDB.forEach((e) => {
        categories.set(e.name, e.id);
      });

      const transaction = this.db.transaction([TABLE_ITEMS], "readwrite");
      const storeItems = transaction.objectStore(TABLE_ITEMS);

      defItems.categories.forEach((category: any) => {
        // console.log(`Adding category: ${category.name}`);
        category.items.forEach((item: string) => {
          // console.log(`Adding item: ${item}`);
          const categoryId = categories.get(category.name) ?? -1;
          const query = storeItems.add({
            name: item,
            category_id: categoryId,
          });

          query.onerror = (ev) => {
            reject(ev);
          };
        });
      });

      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (ev) => {
        reject(ev);
      };
    });
  }

  private async countTable(name: string) {
    return new Promise<number>((resolve) => {
      if (!this.db) {
        resolve(-1);
        return;
      }
      const transaction = this.db.transaction([name], "readonly");
      const store = transaction.objectStore(name);
      const count = store.count();
      count.onsuccess = () => resolve(count.result);
    });
  }

  private async initDefaultCategories() {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.db) {
        reject("Database is null");
        return;
      }
      const transaction = this.db.transaction([TABLE_CATEGORIES], "readwrite");
      const store = transaction.objectStore(TABLE_CATEGORIES);

      const uniqueCategories = new Set<string>();
      defItems.categories.forEach((category: any) => {
        // console.log(`Adding category: ${category.name}`);
        uniqueCategories.add(category.name);
      });

      uniqueCategories.forEach((category) => {
        const query = store.add({
          name: category,
        });

        query.onerror = (event) => {
          event.stopPropagation();
          reject(event);
        };
      });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  private async initDefaultTrip() {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.db) {
        reject("Database is null");
        return;
      }
      const transaction = this.db.transaction([TABLE_TRIPS], "readwrite");
      const store = transaction.objectStore(TABLE_TRIPS);

      const query = store.add({
        name: "default",
      });

      query.onerror = (event) => {
        event.stopPropagation();
        reject(event);
      };

      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  private async initDefaultTrip2() {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.db) {
        reject("Database is NULL");
        return;
      }

      const tripsDB: Array<TripType> = await this.getTable(TABLE_TRIPS);
      const tripId = tripsDB[0]?.id;
      if (!tripId) {
        reject("No trip found in database");
        return;
      }
      const itemsDB: Array<ItemType> = await this.getTable(TABLE_ITEMS);

      const transaction = this.db.transaction(
        [TABLE_TRIPS_AND_ITEMS],
        "readwrite"
      );
      const storeItems = transaction.objectStore(TABLE_TRIPS_AND_ITEMS);

      itemsDB.forEach((e) => {
        const query = storeItems.add({
          trip_id: tripId,
          item_id: e.id,
          packed: false,
          enabled: true,
        });
        query.onerror = (ev) => {
          reject(ev);
        };
      });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (ev) => {
        reject(ev);
      };
    });
  }

  // ----- STATIC -----
  private static dataBaseInstance?: DataBase;
  static async getInstance() {
    if (this.dataBaseInstance === undefined) {
      this.dataBaseInstance = new DataBase();
      await this.dataBaseInstance.open();
    }
    return this.dataBaseInstance;
  }
  static delete() {
    window.indexedDB.deleteDatabase(DataBase.DATABASE_NAME);
  }
}

export default DataBase;
