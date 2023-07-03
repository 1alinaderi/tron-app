import Bsc from "./bsc";
import Tron from "./tron";


function App(props) {
  const { ethereumClient } = props;

  return (
    <div>
        <Bsc ethereumClient={ethereumClient} />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Tron />
    </div>
  );
}

export default App;
