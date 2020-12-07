import React, { useEffect, useRef, useState } from "react";
import soundfile from "./notify.mp3";

const ws = new WebSocket("wss://expresshere.me:8001");
var pager = 1;

export default function Chatbox() {
  const [message, setMessage] = useState("");
  const [msgArray, setMsgArray] = useState([]);
  const [name, setName] = useState("");
  const [counter, setCounter] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const userIpRef = useRef();
  const msgIpRef = useRef();

  const notify = new Audio(soundfile);

  async function fetchMessages(page_no) {
    const res = await (
      await fetch(`https://expresshere.me/logs?page=${page_no}`)
    ).json();
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
    if (count) {
      setCounter(count);
    }
    const obj = {
      name: name_res,
      message: msg,
    };
    if (name_res && msg) {
      setMsgArray([...msgArray, obj]);
      const chatDiv = document.getElementById("chatbox");
      chatDiv.scrollTop = chatDiv.scrollHeight;
      if (name_res !== name) {
        notify.play();
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
      const res = await await (
        await fetch("https://expresshere.me/logs/")
      ).json();
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
        className="d-flex align-items-center justify-content-center flex-column"
      >
        <div className="my-2">
          <h2>Bitch About Anything Anonymously</h2>
        </div>
        <div className="container shadow d-flex flex-column">
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
                  <div key={index} className="shadow-sm p-2 mb-2 d-flex">
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
          <div className="field border border-primary mb-2">
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
                  className="h-100 w-100 bg-warning text-dark font-weight-bold px-4"
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
      </div>
    </>
  );
}
