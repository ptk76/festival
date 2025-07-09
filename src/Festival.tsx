import style from "./Festival.module.css";
import festivalData from "./db/cp2025.json";
import { useState } from "react";

function getIconPath(url: string) {
  if (url.includes("wikipedia")) return "src/assets/wikipedia.png";
  if (url.includes("youtube")) return "src/assets/youtube.png";
  if (url.includes("spotify")) return "src/assets/spotify.jfif";
  if (url.includes("facebook")) return "src/assets/facebook.webp";
  return "src/assets/earth.png";
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
    <div>
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
      return <>😖</>;
    case 1:
      return <>🙁</>;
    case 3:
      return <>🙂</>;
    case 4:
      return <>☺️</>;
  }
  return <>😐</>;
}

function Score(props: { name: string }) {
  const [score, setScore] = useState(2);
  return (
    <div
      onClick={() => {
        console.log(props.name);
        setScore((score + 1) % 5);
      }}
    >
      <ScoreIcon score={score} />
    </div>
  );
}

function ListEvents(props: { events: any[] }) {
  const events = props.events.map((event) => (
    <div>
      <Score name={event.name} />
      {event.time} {event.name} <ListUrls urls={event.urls} />
    </div>
  ));
  return <>{events}</>;
}

function ListStages(props: { stages: any[] }) {
  const stages = props.stages.map((stage) => (
    <div>
      {stage.name} <ListEvents events={stage.events} />
    </div>
  ));
  return <>{stages}</>;
}

function ListDates() {
  const dates = festivalData.days.map((day) => (
    <div>
      {day.date} <ListStages stages={day.stages} />
    </div>
  ));
  return <>{dates}</>;
}

function FestivalEvent() {
  return (
    <div className={style.root}>
      <div>{festivalData.festival}</div>
      <ListDates />
    </div>
  );
}

export default FestivalEvent;
