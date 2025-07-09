import { createContext } from "react";
import DataBase, { TABLE_SCORES } from "./db";

const DEFAULT_SCORE = 2;
export type ScoresType = {
  id: number;
  name: string;
  score: number;
};

class DataBaseFacade {
  private db: DataBase;

  constructor(db: DataBase) {
    this.db = db;
  }

  public async getScore(name: string): Promise<number> {
    const result = (await this.db.getRecords(
      TABLE_SCORES,
      (score: any) => score.name === name.toLocaleLowerCase()
    )) as unknown as ScoresType[];
    if (result.length === 0) return DEFAULT_SCORE;
    return result[0].score;
  }

  public async updateScore(name: string, score: number) {
    const result = (await this.db.getRecords(
      TABLE_SCORES,
      (score: any) => score.name === name.toLocaleLowerCase()
    )) as unknown as ScoresType[];
    if (result.length === 0) {
      this.db.addRecord(TABLE_SCORES, {
        name: name.toLocaleLowerCase(),
        score: score,
      });
    } else {
      this.db.updateRecord(TABLE_SCORES, {
        id: result[0].id,
        name: name.toLocaleLowerCase(),
        score: score,
      });
    }
  }

  public delete() {
    DataBase.delete();
  }
}

export default DataBaseFacade;
export const DataBaseFacadeContext = createContext<DataBaseFacade>(
  null as unknown as DataBaseFacade
);
