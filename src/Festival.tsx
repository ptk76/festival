import style from "./Festival.module.css";
import festivalData from "./db/cp2025.json";
import { useContext, useEffect, useState } from "react";
import { DataBaseFacadeContext } from "./db/db_facade";

let fakeKey = 0;

function getIconPath(url: string) {
  if (url.includes("wikipedia")) return "src/assets/wikipedia.png";
  if (url.includes("youtube")) return "src/assets/youtube.png";
  if (url.includes("spotify")) return "src/assets/spotify.jfif";
  if (url.includes("facebook")) return "src/assets/facebook.webp";
  return "src/assets/earth.webp";
}

function GetIconForUrl(props: { url: string }) {
  return (
    <div>
      <img src={getIconPath(props.url)} height="24px" />
    </div>
  );
}

function ListUrls(props: { urls: string[] }) {
  const urls = props.urls.map((url) => (
    <div key={fakeKey++} className={style.url}>
      <a href={url} target="_blank">
        <GetIconForUrl url={url} />
      </a>
    </div>
  ));
  return <>{urls}</>;
}

function ScoreIcon(props: { score: number }) {
  switch (props.score) {
    case 0:
      return <img className={style.scoreicon} src="src/assets/score_0.png" />;
    case 1:
      return <img className={style.scoreicon} src="src/assets/score_1.png" />;
    case 3:
      return <img className={style.scoreicon} src="src/assets/score_3.png" />;
    case 4:
      return <img className={style.scoreicon} src="src/assets/score_4.png" />;
  }
  return <img className={style.scoreicon} src="src/assets/score_2.png" />;
}

function Score(props: { name: string }) {
  const [score, setScore] = useState(2);
  const db = useContext(DataBaseFacadeContext);

  const readScore = async () => {
    const dbScore = await db.getScore(props.name);
    setScore(dbScore);
  };
  useEffect(() => {
    readScore();
    return () => {};
  }, []);

  return (
    <div
      className={style.score}
      onClick={async () => {
        const newScore = (score + 1) % 5;
        setScore(newScore);
        await db.updateScore(props.name.toLocaleLowerCase(), newScore);
      }}
    >
      <ScoreIcon score={score} />
    </div>
  );
}

function ListEvents(props: { events: any[] }) {
  const events = props.events.map((event) => (
    <div key={fakeKey++} className={style.events}>
      <Score name={event.name} />
      {event.time} <div className={style.eventname}>{event.name}</div>{" "}
      <ListUrls urls={event.urls} />
    </div>
  ));
  return <>{events}</>;
}

function ListStages(props: { stages: any[] }) {
  const stages = props.stages.map((stage) => (
    <div key={fakeKey++} className={style.stages}>
      {stage.name} <ListEvents events={stage.events} />
    </div>
  ));
  return <>{stages}</>;
}

function ListDates() {
  const dates = festivalData.days.map((day) => (
    <div key={fakeKey++} className={style.dates}>
      {day.date} <ListStages stages={day.stages} />
    </div>
  ));
  return <>{dates}</>;
}

function FestivalEvent() {
  return (
    <div className={style.root}>
      <div className={style.festival}>{festivalData.festival}</div>
      <ListDates />
    </div>
  );
}

export default FestivalEvent;
