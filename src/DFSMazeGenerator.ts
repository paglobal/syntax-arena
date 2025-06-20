interface Cell {
  row: number;
  columns: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

function shuffleArray(array: string[]): string[] {
  const shuffledArray: string[] = [];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    shuffledArray[i] = array[j];
    shuffledArray[j] = array[i];
  }
}

export function generateMaze(noOfRows: number, noOfColumns: number) {
  const visited: boolean[][] = [];
  const maze: Cell[][]  = [];
  const directions = [
    { dr: -1, dc: 0, wall: "top", neighborWall: "bottom" },
    { dr: 1, dc: 0, wall: "bottom", neighborWall: "top" }, 
    { dr: 0, dc: 1, wall: "right", neighborWall: "left" }, 
    { dr: 0, dc: -1, wall: "left", neighborWall: "right" },
  ] as const;

  for (let row = 0; row < noOfRows; r++) {
    maze[row] = [];
    visited[row] = [];
    for (let column = 0; column < noOfColumns; c++) {
      maze[row][column] = {
        row,
        column,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true,
        },
        visited: false,
      };
      this.visited[r][c] = false;
    }
  }

  function dfs(row: number, column: number) {
    maze[row][column].visited = true;
    visited[row][column] = true;

    const shuffledDirections = shuffleArray(directions);

    for(const direction of )
    
  }

  const startRow = 0;
  const startColumn = 0;
  
  return dfs(startRow, startColumn)
}