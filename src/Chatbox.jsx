import React, { useEffect, useState } from "react";
const ws = new WebSocket("ws://54.83.84.238:8000");

export default function Chatbox() {
  const [message, setMessage] = useState("");
  const [msgArray, setMsgArray] = useState([]);
  const [name, setName] = useState("");

  function msgSender(e) {
    e.preventDefault();
    if (name === "") {
      callModal();
    } else {
      ws.send(JSON.stringify({ message: message, name: name }));
      setMessage("");
    }
  }

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data).message;
    const name = JSON.parse(e.data).name;
    const obj = {
      name: name,
      message: msg,
    };
    setMsgArray([...msgArray, obj]);
  };

  function callModal() {
    document.getElementById("modal-launcher").click();
  }

  function setUsername(e) {
    e.preventDefault();
    setName(name);
  }


  useEffect(() => {
    callModal();
  }, []);

  return (
    <>
      <button
        id="modal-launcher"
        type="button"
        class="btn btn-primary"
        data-toggle="modal"
        data-target="#exampleModalCenter"
        style={{ display: "none" }}
      >
        Launch demo modal
      </button>

      <div
        class="modal fade"
        id="exampleModalCenter"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLongTitle">
                Enter nickname to continue
              </h5>
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={(e) => setUsername(e)}>
              <div class="modal-body">
                <input
                  type="text"
                  className="border-none p-2 font-weight-bold w-100"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  required
                />
              </div>
              <div class="modal-footer">
                <button
                  type="submit"
                  class="btn btn-primary"
                  data-dismiss="modal"
                >
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
          <h1>Bitch About Anything Anonymously</h1>
        </div>
        <div className="container shadow d-flex flex-column">
          <div
            className="log flex-fill p-3"
            style={{ overflowY: "scroll" }}
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
                />
              </div>
              <div>
                <button className="h-100 w-100 bg-warning text-dark font-weight-bold px-4" type="submit">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
