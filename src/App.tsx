import { styleMap } from "lit/directives/style-map.js";
import { Cell, generateMaze } from "./generateMaze";

function App() {
  const containerStyles = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  };

  const border = "1px solid black";
  const cellSize = "60px";
  const gridSize = 15;

  const cellStyles = (cell: Cell) => ({
    borderTop: cell.walls.top ? border : null,
    borderLeft: cell.walls.left ? border : null,
    borderBottom: cell.walls.bottom ? border : null,
    borderRight: cell.walls.right ? border : null,
    backgroundColor: "#08759E",
    width: cellSize,
    height: cellSize,
  });

  const rowStyles = {
    display: "flex",
  };

  const maze = generateMaze(gridSize, gridSize);

  return () => (
    <div $attr:style={styleMap(containerStyles)}>
      {maze.map((row) => (
        <div $attr:style={styleMap(rowStyles)}>
          {row.map((cell) => (
            <div $attr:style={styleMap(cellStyles(cell))}></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;