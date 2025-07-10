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

function FixedScore(props: { name: string }) {
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
    <div className={style.score}>
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

function isToday(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear === now.getFullYear &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function DateView(props: { day: any }) {
  const [show, setShow] = useState(true);

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

  useEffect(() => {
    setShow(isToday(props.day.date));
    return () => {};
  }, []);

  return (
    <div key={fakeKey++} className={style.dates}>
      <div
        className={style.daytitle}
        onClick={() => {
          setShow(!show);
        }}
      >
        {getDay(props.day.date)}
      </div>

      {show && <ListStages stages={props.day.stages} />}
    </div>
  );
}

function ListDates() {
  const dates = festivalData.days.map((day) => {
    return <DateView day={day} />;
  });
  return <>{dates}</>;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function isTimeNow(datetimeStr: string) {
  console.log(datetimeStr);
  const now = new Date();
  const nowStart = new Date(datetimeStr);
  const nowEnd = addMinutes(nowStart, 60);
  console.log(nowStart, nowEnd, now >= nowStart && now < nowEnd);

  return now >= nowStart && now < nowEnd;
}

function FindNow() {
  const [div, setDiv] = useState(<>-</>);

  useEffect(() => {
    const day = festivalData.days.find((day) => isToday(day.date));
    if (day) {
      day.stages.forEach((stage) => {
        const event = stage.events.find((event) =>
          isTimeNow(day.date + "." + event.time)
        );
        console.log(event);
        if (event)
          setDiv(
            <>
              <div className={style.stages}>
                {stage.name}
                <div className={style.events}>
                  <FixedScore name={event.name} />
                  {event.time}{" "}
                  <div className={style.eventname}>{event.name}</div>{" "}
                </div>
              </div>
            </>
          );
      });
    }

    return () => {};
  }, []);

  return div;
}

function isTimeNext(datetimeStr: string) {
  const now = new Date();
  const next = new Date(datetimeStr);
  return now < next;
}

function FindNext() {
  const [div, setDiv] = useState(<>-</>);

  useEffect(() => {
    const day = festivalData.days.find((day) => isToday(day.date));
    if (day) {
      day.stages.forEach((stage) => {
        const event = stage.events.find((event) =>
          isTimeNext(day.date + "." + event.time)
        );
        console.log(event);
        if (event)
          setDiv(
            <>
              <div className={style.stages}>
                {stage.name}
                <div className={style.events}>
                  <FixedScore name={event.name} />
                  {event.time}{" "}
                  <div className={style.eventname}>{event.name}</div>{" "}
                </div>
              </div>
            </>
          );
      });
    }

    return () => {};
  }, []);

  return div;
}

function FestivalEvent() {
  return (
    <div className={style.root}>
      <div className={style.festival}>{festivalData.festival}</div>
      <div>Now:</div> <FindNow />
      <div>Next:</div> <FindNext />
      <ListDates />
    </div>
  );
}

export default FestivalEvent;
