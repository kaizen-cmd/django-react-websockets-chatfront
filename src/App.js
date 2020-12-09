import Chatbox from "./Chatbox";
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";

function App() {
  return (
    <div className="App">
      <ReactNotification />
      <Chatbox />
    </div>
  );
}

export default App;
