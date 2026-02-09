import { Launcher } from "./components/launcher";
import { TitleBar } from "./components/titlebar";
import "./index.css";

function App() {
  return (
    <div className="h-full w-full bg-black overflow-hidden rounded-[24px] border border-white/10 shadow-2xl flex flex-col">
      <TitleBar />
      <div className="flex-1 overflow-hidden">
        <Launcher />
      </div>
    </div>
  );
}

export default App;
