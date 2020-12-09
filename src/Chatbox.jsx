import React, { useEffect, useRef, useState } from "react";
import soundfile from "./notify.mp3";
import { store } from "react-notifications-component";

const DEBUG = false;
var WEBSOCKET_URL, HTTP_URL;

if (DEBUG) {
  WEBSOCKET_URL = "ws://127.0.0.1:8000";
  HTTP_URL = "http://127.0.0.1:8000";
} else {
  WEBSOCKET_URL = "wss://expresshere.me:8001";
  HTTP_URL = "https://expresshere.me";
}

var pager = 1;
const ws = new WebSocket(WEBSOCKET_URL);

export default function Chatbox() {
  const [message, setMessage] = useState("");
  const [msgArray, setMsgArray] = useState([]);
  const [name, setName] = useState("");
  const [counter, setCounter] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userArray, setUserArray] = useState([]);

  const userIpRef = useRef();
  const msgIpRef = useRef();

  const notify = new Audio(soundfile);

  async function fetchMessages(page_no) {
    const res = await (await fetch(`${HTTP_URL}/logs?page=${page_no}`)).json();
    setMsgArray([...res.results.reverse(), ...msgArray]);
  }

  function msgSender(e) {
    e.preventDefault();
    if (name === "") {
      callModal();
    } else {
      ws.send(JSON.stringify({ message: message, name: name }));
      setMessage("");
    }
  }

  ws.onmessage = async (e) => {
    const msg = await JSON.parse(e.data).message;
    const name_res = await JSON.parse(e.data).name;
    const count = await JSON.parse(e.data).counter;
    const disconnectMsg = await JSON.parse(e.data).disconnect;
    const online = await JSON.parse(e.data).online;
    console.log(">>>", online);
    if (online) {
      setUserArray(online);
    }
    if (count) {
      setCounter(count);
    }
    if (disconnectMsg) {
      store.addNotification({
        title: `${name_res ? name_res : "Unknown User"} has left the party`,
        message: `Sad to see you go ${name_res ? name_res : "Unknown User"}`,
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 2000,
          onScreen: true,
        },
      });
    }
    const obj = {
      name: name_res,
      message: msg,
    };
    if (name_res && msg) {
      if (msg === "100pnotify") {
        store.addNotification({
          title: `${name_res} joined the party`,
          message: `Welcome ${name_res} to anonymous chat room !`,
          type: "success",
          insert: "top",
          container: "top-right",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 2000,
            onScreen: true,
          },
        });
        setUserArray([[name_res], ...userArray]);
      } else {
        setMsgArray([...msgArray, obj]);
        const chatDiv = document.getElementById("chatbox");
        chatDiv.scrollTop = chatDiv.scrollHeight;
        if (name_res !== name) {
          notify.play();
        }
      }
    }
  };

  function callModal() {
    document.getElementById("modal-launcher").click();
    setTimeout(() => {
      userIpRef.current.focus();
    }, 1000);
  }

  function setUsername(e) {
    document.getElementById("dismiss_modal").click();
    e.preventDefault();
    setName(name);
    ws.send(JSON.stringify({ message: "100pnotify", name: name }));
    setTimeout(() => {
      msgIpRef.current.focus();
    }, 1500);
  }

  function scrollHnadler(e) {
    const current = e.target.scrollTop;
    if (current <= 0) {
      pager += 1;
      if (pager < totalPages + 1) {
        fetchMessages(pager);
        e.target.scrollTop = 200;
        pager += 1;
      }
    }
  }

  useEffect(() => {
    async function fetchMessagesWrapper() {
      await fetchMessages(pager);
      const chatDiv = document.getElementById("chatbox");
      chatDiv.scrollTop = chatDiv.scrollHeight;
      const res = await await (await fetch(`${HTTP_URL}/logs/`)).json();
      if (res.count % 20 === 0) {
        setTotalPages(res.count / 20);
      } else {
        setTotalPages(Math.floor(res.count / 20) + 1);
      }
    }
    fetchMessagesWrapper();
    if (localStorage.getItem("name")) {
      setName(localStorage.getItem("name"));
    } else {
      callModal();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <button
        id="modal-launcher"
        type="button"
        className="btn btn-primary"
        data-toggle="modal"
        data-target="#exampleModalCenter"
        style={{ display: "none" }}
      >
        Launch demo modal
      </button>
      <div
        className="modal fade"
        id="exampleModalCenter"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">
                Enter nickname to continue
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={(e) => setUsername(e)}>
              <div className="modal-body">
                <input
                  type="text"
                  className="border-none p-2 font-weight-bold w-100"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  ref={userIpRef}
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary d-none"
                  data-dismiss="modal"
                  id="dismiss_modal"
                ></button>
                <button type="submit" className="btn btn-primary">
                  Start
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div
        style={{ height: "100vh" }}
        className="d-flex align-items-center justify-content-center"
      >
        <div className="shift w-25 px-4 h-80">
          <div className="h-100 shadow px-2 pt-4 border-5">
            <div className="text-center">
              <h6 className="font-weight-bold m-0 mb-2">Users online</h6>
            </div>
            <div className="overflow-scroll h-90 px-3">
              {userArray.map((user, index) => {
                return (
                  <div
                    className="shadow-sm mb-2 py-2 px-3 border-5 names"
                    key={index}
                  >
                    {user}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="container shadow d-flex flex-column border-5">
          <div className="d-flex w-100 p-3">
            <div className="ml-auto">
              <p className="font-weight-bold m-0">
                Users online: <span className="text-danger">{counter}</span>
              </p>
            </div>
          </div>
          <div
            className="log flex-fill p-3"
            style={{ overflowY: "scroll" }}
            id="chatbox"
            onScroll={(e) => scrollHnadler(e)}
          >
            <div>
              {msgArray.map((msg, index) => {
                return (
                  <div
                    key={index}
                    className="shadow-sm p-2 mb-3 d-flex message-box"
                  >
                    <div>
                      <p className="m-0 font-weight-bold">{msg.name}:&nbsp;</p>
                    </div>
                    <div className="flex-fill">
                      <p className="m-0">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="field border border-primary my-2">
            <form className="d-flex" onSubmit={(e) => msgSender(e)}>
              <div className="flex-fill">
                <input
                  type="text"
                  className="border-none font-weight-bold p-2 w-100"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  placeholder={`Send a message as ${name}...`}
                  ref={msgIpRef}
                />
              </div>
              <div>
                <button
                  className="h-100 w-100 bg-success text-white font-weight-bold px-4"
                  type="submit"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
          <p className="my-2 text-center">
            Hello, welcome to anonymous chat app made using{" "}
            <span className="font-weight-bold">
              Websockets, Django Channels, React, Django Rest, Nginx, Daphne,
              Gunicorn
            </span>
            😁😁
          </p>
        </div>
        <div className="shift w-25 px-4 h-80">
          <div className="h-100 shadow px-2 pt-4 border-5">
            <div className="text-center">
              <h6 className="font-weight-bold m-0 mb-2">Trending Topics</h6>
            </div>
            <div className="overflow-scroll h-90 px-3">
              <div className="shadow-sm mb-2 py-2 px-3 border-5 topics">
                MIT ADT
              </div>
              <div className="shadow-sm mb-2 py-2 px-3 border-5 topics">
                World Class Education
              </div>
              <div className="shadow-sm mb-2 py-2 px-3 border-5 topics">
                Placements
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
