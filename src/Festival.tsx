import style from "./Festival.module.css";
import festivalData from "./db/cp2025.json";
import { useContext, useEffect, useState } from "react";
import { DataBaseFacadeContext } from "./db/db_facade";

let fakeKey = 0;

import imgWiki from "./assets/wikipedia.webp";
import imgSpotify from "./assets/spotify.webp";
import imgYoutube from "./assets/youtube.webp";
import imgFacebook from "./assets/facebook.webp";
import imgEarth from "./assets/earth.webp";

function getIconPath(url: string) {
  if (url.includes("wikipedia")) return imgWiki;
  if (url.includes("youtube")) return imgYoutube;
  if (url.includes("spotify")) return imgSpotify;
  if (url.includes("facebook")) return imgFacebook;
  return imgEarth;
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

import imgScore0 from "./assets/score_0.png";
import imgScore1 from "./assets/score_1.png";
import imgScore2 from "./assets/score_2.png";
import imgScore3 from "./assets/score_3.png";
import imgScore4 from "./assets/score_4.png";

function ScoreIcon(props: { score: number }) {
  switch (props.score) {
    case 0:
      return <img className={style.scoreicon} src={imgScore0} />;
    case 1:
      return <img className={style.scoreicon} src={imgScore1} />;
    case 3:
      return <img className={style.scoreicon} src={imgScore3} />;
    case 4:
      return <img className={style.scoreicon} src={imgScore4} />;
  }
  return <img className={style.scoreicon} src={imgScore2} />;
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
  const getDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dayNames[day];
  };
  const dates = festivalData.days.map((day) => (
    <div key={fakeKey++} className={style.dates}>
      {getDay(day.date)} <ListStages stages={day.stages} />
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
