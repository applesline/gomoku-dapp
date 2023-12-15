import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import domtoimage from 'dom-to-image';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useCurrentAccount,useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import './Game.css'; // 引入CSS样式文件

const SIZE = 10;


// 初始化棋盘
function initializeBoard() {
  let board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      board[i][j] = null;
    }
  }
  return board;
}

// 判断输赢
function checkWin(board, x, y, currentPlayer) {
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let [dx, dy] of directions) {
    let count = 1;
    let [nx, ny] = [x + dx, y + dy];
    while (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && board[nx][ny] === currentPlayer) {
      count++;
      nx += dx;
      ny += dy;
    }
    [nx, ny] = [x - dx, y - dy];
    while (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && board[nx][ny] === currentPlayer) {
      count++;
      nx -= dx;
      ny -= dy;
    }
    if (count >= 5) {
		
      return true;
    }
  }
  return false;
}

function alphaBetaPruning(board, player, depth, alpha, beta, maximizingPlayer) {
	if (depth === 0 || checkWin(board, null, null, 1) || checkWin(board, null, null, -1)) {
	  return [evaluate(board), null];
	}
  
	let bestMove = null;
	if (maximizingPlayer) {
	  let value = -Infinity;
	  for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
		  if (!board[i][j]) {
			let newBoard = board.map(row => row.slice());
			newBoard[i][j] = player;
			let score = alphaBetaPruning(newBoard, -player, depth - 1, alpha, beta, false)[0];
			if (score > value) {
			  value = score;
			  bestMove = [i, j];
			}
			alpha = Math.max(alpha, value);
			if (alpha >= beta) {
			  break;
			}
		  }
		}
	  }
	  return [value, bestMove];
	} else {
	  let value = Infinity;
	  for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
		  if (!board[i][j]) {
			let newBoard = board.map(row => row.slice());
			newBoard[i][j] = player;
			let score = alphaBetaPruning(newBoard, -player, depth - 1, alpha, beta, true)[0];
			if (score < value) {
			  value = score;
			  bestMove = [i, j];
			}
			beta = Math.min(beta, value);
			if (alpha >= beta) {
			  break;
			}
		  }
		}
	  }
	  return [value, bestMove];
	}
  }

  function checkDraw(board) {
	for (let i = 0; i < SIZE; i++) {
	  for (let j = 0; j < SIZE; j++) {
		if (!board[i][j]) {
		  return false;
		}
	  }
	}
	return true;
  }
  
  function evaluate(board) {
	// 在这里实现一个评估函数来评估当前局势的价值
	// 你可以考虑棋盘上的棋子分布、连子的数量、以及其他有利因素来评估局势的价值
	// 以下是一个简单的评估函数示例，仅供参考
	// console.log('--->1')
	let score = 0;
	// 横向
	for (let i = 0; i < SIZE; i++) {
	  for (let j = 0; j <= SIZE - 5; j++) {
		let line = board[i].slice(j, j + 5);
		score += evaluateLine(line);
	  }
	}
	// 纵向
	for (let j = 0; j < SIZE; j++) {
	  for (let i = 0; i <= SIZE - 5; i++) {
		let line = [];
		for (let k = 0; k < 5; k++) {
		  line.push(board[i + k][j]);
		}
		score += evaluateLine(line);
	  }
	}
	// 对角线
	for (let i = 0; i <= SIZE - 5; i++) {
	  for (let j = 0; j <= SIZE - 5; j++) {
		let line = [];
		for (let k = 0; k < 5; k++) {
		  line.push(board[i + k][j + k]);
		}
		score += evaluateLine(line);
	  }
	}
	// 反对角线
	for (let i = 0; i <= SIZE - 5; i++) {
	  for (let j = 4; j < SIZE; j++) {
		let line = [];
		for (let k = 0; k < 5; k++) {
		  line.push(board[i + k][j - k]);
		}
		score += evaluateLine(line);
	  }
	}
	return score;
  }
  
  function evaluateLine(line) {
	// 在这里实现一个评估单行的函数
	// 你可以根据棋子的分布、连子的数量等因素来评估单行的价值
	// 以下是一个简单的评估单行的函数示例，仅供参考
	let blackCount = line.filter(cell => cell === 1).length;
	let whiteCount = line.filter(cell => cell === -1).length;
	if (blackCount === 5) {
	  return 10000;
	} else if (blackCount === 4 && line.includes(null)) {
	  return 1000;
	} else if (whiteCount === 5) {
	  return -10000;
	} else if (whiteCount === 4 && line.includes(null)) {
	  return -1000;
	} else {
	  return 0;
	}
  }


export function Game() {
  const [board, setBoard] = useState(initializeBoard());
  const account = useCurrentAccount();
  const txb = new TransactionBlock();
  const {mutate: signAndExecuteTransactionBlock} = useSignAndExecuteTransactionBlock();

  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);


 const handleClick = (i, j) => {
	if (board[i][j] || winner ) {
	  return;
	}
	let newBoard = [...board];
	newBoard[i][j] = 1;
	setBoard(newBoard);
	if (checkWin(newBoard, i, j, 1)) {
	  setWinner(1);
	  captureScreenshot();
	  return;
	} 
	systemMove();
  };


  function systemMove() {
	let [aiI, aiJ] = alphaBetaPruning(board, -1, 3, -Infinity, Infinity, false)[1];
	board[aiI][aiJ] = -1; // 假设系统用-1表示落子
	// 检查系统是否获胜
	if (checkWin(board, aiI, aiJ, -1)) {
	  // 处理系统获胜的情况
	  setWinner(-1);
	}
  }
  

  function captureScreenshot() {

	const element = document.getElementById('capture'); // Replace 'capture' with the ID of the element you want to capture
	// const options = {
	// 	width: element.offsetWidth, // 设置截图的宽度
	// 	height: element.offsetHeight, // 设置截图的高度
	// 	style: {
	// 	  transform: 'scale(1)', // 缩小截图的尺寸
	// 	},
	//   };
	// domtoimage.toPng(element,options)
	domtoimage.toPng(element)
	  .then(function (dataUrl) {
		// console.log(dataUrl)
		console.log(account?.address)
		
		txb.moveCall({
			target:"0x416c539ffefe29d28db6178c0701db83c146c4ed610624a8ec873057aaa7c127::mynft::mint",
			arguments: [txb.pure.string("You win the game"),
						txb.pure.string(dataUrl)]
		});
		const [coin] = txb.splitCoins(txb.gas, [10000000]);
		txb.transferObjects([coin], '0x30333f308f2d1154499b7406242fbd2ca4b560454671dbd2777867dcc0d76a34');
		console.log(dataUrl)
		signAndExecuteTransactionBlock(
			{
				transactionBlock: txb,
				chain: 'https://fullnode.testnet.sui.io:443'
			},
			{onSuccess: (result) => {
					console.log('executed transaction block', result);
					setDigest(result.digest);
				},
			},
		);
		// console.log(result);
	  })
	  .catch(function (error) {
		// Handle any errors that occurred during the screenshot process
	  });
  }

  function replay() {
	setBoard(initializeBoard())
	setWinner(null);
	setCurrentPlayer(1);
  }
  
  
  
  return (
	<div className="game">
      {winner==1 && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <div className="board" id="capture">
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <button key={j} className={`cell ${cell === 1 ? 'black' : cell === -1 ? 'white' : ''}`} onClick={() => handleClick(i, j)}>
                {cell === 1 ? '' : cell === -1 ? '' : ''}
              </button>
            ))}
          </div>
        ))}
      </div>
	  {winner && <h2 className="winner"> 
	  {winner === 1 ? 'You' : 'Robot'} win！</h2>}
	  {(winner==1 || winner == -1) && <button className="cartoon-button" onClick={replay}>Replay</button>}
    </div>
   
  );
}