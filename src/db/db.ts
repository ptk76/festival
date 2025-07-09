type GenericType = {
  id: number;
  name: string;
  score: number;
};

export const TABLE_SCORES = "scores";
type TABLES = typeof TABLE_SCORES;

class DataBase {
  static readonly DATABASE_VER = 1;
  static readonly DATABASE_NAME = "scores";

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

  // ----- PRIVATE -----
  private createTables(event: IDBVersionChangeEvent) {
    const db = (event.target as IDBOpenDBRequest).result;
    console.log(`Upgrading to version ${db.version}`);

    db.onerror = (event) => {
      console.error("Error initializing database", event);
    };

    const tripsTable = db.createObjectStore(TABLE_SCORES, {
      keyPath: "id",
      autoIncrement: true,
    });
    tripsTable.createIndex("name", "name", { unique: true });
    tripsTable.createIndex("score", "score", { unique: false });
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
