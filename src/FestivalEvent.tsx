import style from "./FestivalEvent.module.css";

function FestivalEvent(props: { time: string; name: string; urls: string[] }) {
  return (
    <div className={style.root}>
      <div>{props.time}</div>
      <div>{props.name}</div>
      <div>{props.urls[0]}</div>
    </div>
  );
}

export default FestivalEvent;
