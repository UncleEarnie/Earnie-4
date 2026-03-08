/*
Developer note:
- Mount point: renders inside #earnie-match-root. If missing, this module creates it inside <main> (or <body> fallback).
- Levels: defined in LEVELS_V0 below as plain JSON objects (objectiveType, targets, moveBudget, stars).
- Bank Tokens: earned from 4/5 matches and player-triggered specials; spent on Add Move, Convert Tile, Shuffle, Stabilise.
- Telemetry storage: full event stream + level summaries persisted in localStorage key "earnieMatchV0:lastRun".
- Exports: end modal (and top tools) provide telemetry JSON and levels_summary.csv downloads.
- Tuning: change CONFIG and LEVELS_V0 constants for board size, colors, costs, token cap, scoring and rewards.
*/
(() => {
  'use strict';

  const CONFIG = {
    rows: 8,
    cols: 8,
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    tokenCap: 10,
    maxAddMovesPerLevel: 5,
    pointsPerTile: 10,
    maxCascadeSteps: 24,
    costs: {
      addMove: 2,
      convertTile: 2,
      shuffle: 3,
      stabilise: 3,
      hintMoves: 1,
      undoMoves: 2
    }
  };

  const LEVELS_V0 = [
    { id: 'L1', name: 'Level 1', objectiveType: 'score', scoreTarget: 700, moveBudget: 18, star2Score: 1000, star3Score: 1300 },
    { id: 'L2', name: 'Level 2', objectiveType: 'collect', targetColor: 'blue', collectTarget: 20, moveBudget: 20, star2Score: 900, star3Score: 1200 },
    { id: 'L3', name: 'Level 3', objectiveType: 'score', scoreTarget: 1100, moveBudget: 20, star2Score: 1350, star3Score: 1650 },
    { id: 'L4', name: 'Level 4', objectiveType: 'collect', targetColor: 'green', collectTarget: 24, moveBudget: 22, star2Score: 1100, star3Score: 1450 },
    { id: 'L5', name: 'Level 5', objectiveType: 'score', scoreTarget: 1500, moveBudget: 22, star2Score: 1800, star3Score: 2200 },
    { id: 'L6', name: 'Level 6', objectiveType: 'collect', targetColor: 'red', collectTarget: 26, moveBudget: 22, star2Score: 1250, star3Score: 1650 },
    { id: 'L7', name: 'Level 7', objectiveType: 'score', scoreTarget: 1850, moveBudget: 24, star2Score: 2300, star3Score: 2800 },
    { id: 'L8', name: 'Level 8', objectiveType: 'collect', targetColor: 'purple', collectTarget: 28, moveBudget: 24, star2Score: 1450, star3Score: 1900 },
    { id: 'L9', name: 'Level 9', objectiveType: 'score', scoreTarget: 2200, moveBudget: 24, star2Score: 2700, star3Score: 3200 },
    { id: 'L10', name: 'Level 10', objectiveType: 'collect', targetColor: 'yellow', collectTarget: 30, moveBudget: 25, star2Score: 1700, star3Score: 2200 }
  ];

  function createRng(seed) {
    let t = seed >>> 0;
    return function rng() {
      t += 0x6D2B79F5;
      let x = Math.imul(t ^ (t >>> 15), t | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function deepCloneBoard(board) {
    return board.map(row => row.map(tile => tile ? { ...tile } : null));
  }

  function hashString(input) {
    let hash = 5381;
    for (let i = 0; i < input.length; i += 1) {
      hash = ((hash << 5) + hash) + input.charCodeAt(i);
      hash |= 0;
    }
    return `h${Math.abs(hash)}`;
  }

  class EarnieMatchV0 {
    constructor(rootEl) {
      this.rootEl = rootEl;
      this.seed = Date.now();
      this.rng = createRng(this.seed);
      this.tileId = 1;
      this.sessionId = `emv0-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      this.events = [];
      this.levelSummaries = [];
      this.lastMoveAtMs = performance.now();

      this.state = {
        levelIndex: 0,
        level: null,
        board: [],
        score: 0,
        movesRemaining: 0,
        addMovesUsed: 0,
        bankTokens: 0,
        objectiveProgress: 0,
        selectedCell: null,
        hintPair: null,
        freeHintTurns: 0,
        pendingTool: null,
        convertTarget: null,
        lastSnapshot: null,
        undoUsed: false,
        streak: 0,
        streakMax: 0,
        streakBreaks: 0,
        moveIndex: 0,
        ended: false,
        levelStats: null
      };

      this.mount();
      this.logEvent({ type: 'session_start', sessionId: this.sessionId, seed: this.seed, timestampIso: nowIso() });
      this.startLevel(0);
    }

    mount() {
      this.rootEl.innerHTML = `
        <section class="emv0-wrap glass">
          <header class="emv0-top">
            <div class="emv0-level-controls">
              <label for="emv0-level-select">Level</label>
              <select id="emv0-level-select"></select>
              <button id="emv0-restart-level" class="btn btn-secondary btn-sm">Restart</button>
              <button id="emv0-new-run" class="btn btn-secondary btn-sm">New Run</button>
            </div>
            <div class="emv0-stats">
              <div class="emv0-chip"><span>Objective</span><strong id="emv0-objective-text"></strong></div>
              <div class="emv0-chip"><span>Moves</span><strong id="emv0-moves"></strong></div>
              <div class="emv0-chip"><span>Tokens</span><strong id="emv0-tokens"></strong></div>
              <div class="emv0-chip"><span>Score</span><strong id="emv0-score"></strong></div>
              <div class="emv0-chip"><span>Streak</span><strong id="emv0-streak"></strong></div>
            </div>
          </header>

          <div class="emv0-main">
            <div>
              <div id="emv0-banner" class="emv0-banner"></div>
              <div id="emv0-board" class="emv0-board" aria-label="Earnie Match board"></div>
            </div>
            <aside class="emv0-tools glass-medium">
              <h3>Bank Tools</h3>
              <button data-tool="addMove" class="btn btn-primary btn-sm emv0-tool-btn">+1 Move (2 tokens)</button>
              <button data-tool="convert" class="btn btn-primary btn-sm emv0-tool-btn">Convert Tile (2 tokens)</button>
              <button data-tool="shuffle" class="btn btn-primary btn-sm emv0-tool-btn">Shuffle (3 tokens)</button>
              <button data-tool="stabilise" class="btn btn-primary btn-sm emv0-tool-btn">Stabilise (3 tokens)</button>

              <h3>Move Tools</h3>
              <button data-tool="hint" class="btn btn-secondary btn-sm emv0-tool-btn">Hint (-1 move)</button>
              <button data-tool="undo" class="btn btn-secondary btn-sm emv0-tool-btn">Undo once (-2 moves)</button>

              <div id="emv0-convert-panel" class="emv0-convert-panel" hidden>
                <p>Select a tile, then choose color:</p>
                <div id="emv0-color-choices" class="emv0-color-choices"></div>
              </div>

              <div class="emv0-export-row">
                <button id="emv0-download-json" class="btn btn-secondary btn-sm">Download telemetry.json</button>
                <button id="emv0-download-csv" class="btn btn-secondary btn-sm">Download levels_summary.csv</button>
              </div>
            </aside>
          </div>
        </section>

        <div id="emv0-end-modal" class="emv0-modal" hidden>
          <div class="emv0-modal-card glass-heavy">
            <h2 id="emv0-end-title"></h2>
            <p id="emv0-end-summary"></p>
            <div id="emv0-end-stars" class="emv0-stars"></div>
            <div id="emv0-end-metrics" class="emv0-end-metrics"></div>
            <div class="emv0-modal-actions">
              <button id="emv0-next-level" class="btn btn-primary">Next Level</button>
              <button id="emv0-retry-level" class="btn btn-secondary">Retry</button>
              <button id="emv0-modal-new-run" class="btn btn-secondary">New Run</button>
              <button id="emv0-modal-json" class="btn btn-secondary btn-sm">JSON</button>
              <button id="emv0-modal-csv" class="btn btn-secondary btn-sm">CSV</button>
            </div>
          </div>
        </div>
      `;

      const select = this.rootEl.querySelector('#emv0-level-select');
      select.innerHTML = LEVELS_V0.map((l, i) => `<option value="${i}">${l.name}</option>`).join('');

      this.bindEvents();
    }

    bindEvents() {
      this.rootEl.querySelector('#emv0-level-select').addEventListener('change', (e) => {
        this.startLevel(Number(e.target.value));
      });

      this.rootEl.querySelector('#emv0-restart-level').addEventListener('click', () => this.startLevel(this.state.levelIndex));
      this.rootEl.querySelector('#emv0-new-run').addEventListener('click', () => this.newRun());
      this.rootEl.querySelector('#emv0-modal-new-run').addEventListener('click', () => this.newRun());
      this.rootEl.querySelector('#emv0-retry-level').addEventListener('click', () => this.startLevel(this.state.levelIndex));
      this.rootEl.querySelector('#emv0-next-level').addEventListener('click', () => {
        const next = Math.min(LEVELS_V0.length - 1, this.state.levelIndex + 1);
        this.startLevel(next);
      });

      this.rootEl.querySelector('#emv0-download-json').addEventListener('click', () => this.downloadTelemetryJson());
      this.rootEl.querySelector('#emv0-download-csv').addEventListener('click', () => this.downloadCsvSummary());
      this.rootEl.querySelector('#emv0-modal-json').addEventListener('click', () => this.downloadTelemetryJson());
      this.rootEl.querySelector('#emv0-modal-csv').addEventListener('click', () => this.downloadCsvSummary());

      this.rootEl.querySelectorAll('.emv0-tool-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tool = btn.getAttribute('data-tool');
          this.useTool(tool);
        });
      });

      this.rootEl.querySelector('#emv0-board').addEventListener('click', (e) => {
        const tileEl = e.target.closest('.emv0-tile');
        if (!tileEl || this.state.ended) return;
        const r = Number(tileEl.getAttribute('data-r'));
        const c = Number(tileEl.getAttribute('data-c'));
        this.handleTileClick(r, c);
      });

      this.rootEl.querySelector('#emv0-color-choices').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-color]');
        if (!btn || !this.state.convertTarget) return;
        this.applyConvertTile(btn.getAttribute('data-color'));
      });

      this.rootEl.querySelector('#emv0-end-modal').addEventListener('click', (e) => {
        if (e.target.id === 'emv0-end-modal') {
          this.hideEndModal();
        }
      });
    }

    newRun() {
      this.seed = Date.now();
      this.rng = createRng(this.seed);
      this.tileId = 1;
      this.sessionId = `emv0-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      this.events = [];
      this.levelSummaries = [];
      this.lastMoveAtMs = performance.now();
      this.logEvent({ type: 'session_start', sessionId: this.sessionId, seed: this.seed, timestampIso: nowIso() });
      this.startLevel(0);
    }

    startLevel(index) {
      this.hideEndModal();
      const level = LEVELS_V0[index];
      this.state.levelIndex = index;
      this.state.level = level;
      this.state.board = this.generatePlayableBoard();
      this.state.score = 0;
      this.state.movesRemaining = level.moveBudget;
      this.state.addMovesUsed = 0;
      this.state.bankTokens = 0;
      this.state.objectiveProgress = 0;
      this.state.selectedCell = null;
      this.state.hintPair = null;
      this.state.freeHintTurns = 0;
      this.state.pendingTool = null;
      this.state.convertTarget = null;
      this.state.lastSnapshot = null;
      this.state.undoUsed = false;
      this.state.streak = 0;
      this.state.streakMax = 0;
      this.state.streakBreaks = 0;
      this.state.moveIndex = 0;
      this.state.ended = false;
      this.state.levelStats = {
        hintsUsed: 0,
        undosUsed: 0,
        shufflesUsed: 0,
        convertsUsed: 0,
        addMovesUsed: 0,
        stabiliseUsed: 0,
        autoShuffles: 0,
        tokensEarned: 0,
        tokensSpent: 0,
        movesMade: 0,
        objectiveProgressPerMove: [],
        nonObjectiveMoves: 0,
        totalMoveTimeMs: 0
      };

      this.rootEl.querySelector('#emv0-level-select').value = String(index);
      this.logEvent({
        type: 'level_start',
        levelId: level.id,
        objectiveType: level.objectiveType,
        target: level.objectiveType === 'score' ? level.scoreTarget : `${level.collectTarget} ${level.targetColor}`,
        moveBudget: level.moveBudget,
        initialBoardHash: this.boardHash(this.state.board),
        timestampIso: nowIso()
      });

      this.render();
      this.checkNoMovesAndAutoShuffle();
      if (this.state.freeHintTurns > 0) this.showBestHint();
    }

    nextTile(color = null, special = null) {
      const chosenColor = color || CONFIG.colors[Math.floor(this.rng() * CONFIG.colors.length)];
      return { id: this.tileId++, color: chosenColor, special };
    }

    generatePlayableBoard() {
      let board = Array.from({ length: CONFIG.rows }, () => Array.from({ length: CONFIG.cols }, () => this.nextTile()));
      let guard = 0;
      while ((this.findMatchRuns(board).length > 0 || this.findValidMoves(board).length === 0) && guard < 300) {
        board = Array.from({ length: CONFIG.rows }, () => Array.from({ length: CONFIG.cols }, () => this.nextTile()));
        guard += 1;
      }
      return board;
    }

    boardHash(board) {
      const serial = board
        .map(row => row.map(tile => {
          const color = tile ? tile.color[0] : '_';
          const sp = tile && tile.special ? tile.special[0] : 'n';
          return `${color}${sp}`;
        }).join(''))
        .join('|');
      return hashString(serial);
    }

    key(r, c) {
      return `${r},${c}`;
    }

    parseKey(k) {
      const [r, c] = k.split(',').map(Number);
      return { r, c };
    }

    inBounds(r, c) {
      return r >= 0 && r < CONFIG.rows && c >= 0 && c < CONFIG.cols;
    }

    areAdjacent(a, b) {
      return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
    }

    swapCells(board, a, b) {
      const temp = board[a.r][a.c];
      board[a.r][a.c] = board[b.r][b.c];
      board[b.r][b.c] = temp;
    }

    findMatchRuns(board) {
      const runs = [];

      for (let r = 0; r < CONFIG.rows; r += 1) {
        let c = 0;
        while (c < CONFIG.cols) {
          const tile = board[r][c];
          if (!tile) { c += 1; continue; }
          let end = c + 1;
          while (end < CONFIG.cols && board[r][end] && board[r][end].color === tile.color) end += 1;
          const len = end - c;
          if (len >= 3) {
            const cells = [];
            for (let x = c; x < end; x += 1) cells.push({ r, c: x });
            runs.push({ orientation: 'h', color: tile.color, cells });
          }
          c = end;
        }
      }

      for (let c = 0; c < CONFIG.cols; c += 1) {
        let r = 0;
        while (r < CONFIG.rows) {
          const tile = board[r][c];
          if (!tile) { r += 1; continue; }
          let end = r + 1;
          while (end < CONFIG.rows && board[end][c] && board[end][c].color === tile.color) end += 1;
          const len = end - r;
          if (len >= 3) {
            const cells = [];
            for (let x = r; x < end; x += 1) cells.push({ r: x, c });
            runs.push({ orientation: 'v', color: tile.color, cells });
          }
          r = end;
        }
      }

      return runs;
    }

    explodeCellsForSpecial(r, c, special) {
      const cells = [];
      if (special === 'stripedH') {
        for (let cc = 0; cc < CONFIG.cols; cc += 1) cells.push({ r, c: cc });
      } else if (special === 'stripedV') {
        for (let rr = 0; rr < CONFIG.rows; rr += 1) cells.push({ r: rr, c });
      } else if (special === 'bomb') {
        for (let rr = r - 1; rr <= r + 1; rr += 1) {
          for (let cc = c - 1; cc <= c + 1; cc += 1) {
            if (this.inBounds(rr, cc)) cells.push({ r: rr, c: cc });
          }
        }
      }
      return cells;
    }

    applyGravity(board) {
      for (let c = 0; c < CONFIG.cols; c += 1) {
        const col = [];
        for (let r = CONFIG.rows - 1; r >= 0; r -= 1) {
          if (board[r][c]) col.push(board[r][c]);
        }
        let idx = 0;
        for (let r = CONFIG.rows - 1; r >= 0; r -= 1) {
          if (idx < col.length) {
            board[r][c] = col[idx];
            idx += 1;
          } else {
            board[r][c] = this.nextTile();
          }
        }
      }
    }

    grantTokens(amount) {
      if (amount <= 0) return;
      const before = this.state.bankTokens;
      this.state.bankTokens = clamp(this.state.bankTokens + amount, 0, CONFIG.tokenCap);
      this.state.levelStats.tokensEarned += Math.max(0, this.state.bankTokens - before);
    }

    spendTokens(amount) {
      if (amount <= 0) return true;
      if (this.state.bankTokens < amount) return false;
      this.state.bankTokens -= amount;
      this.state.levelStats.tokensSpent += amount;
      return true;
    }

    objectiveDeltaFromClears(clearedColors, scoreDelta) {
      if (this.state.level.objectiveType === 'score') return scoreDelta;
      return clearedColors[this.state.level.targetColor] || 0;
    }

    objectiveMet() {
      if (this.state.level.objectiveType === 'score') {
        return this.state.score >= this.state.level.scoreTarget;
      }
      return this.state.objectiveProgress >= this.state.level.collectTarget;
    }

    resolveBoardAfterAction(meta) {
      const board = this.state.board;
      let totalCleared = 0;
      let totalScoreDelta = 0;
      let objectiveDeltaTotal = 0;
      let createdSpecial = null;
      let triggeredSpecial = false;
      let firstMatchSize = 0;
      let pendingExplosions = [];

      if (meta.playerTriggeredSpecialCells && meta.playerTriggeredSpecialCells.length > 0) {
        pendingExplosions = meta.playerTriggeredSpecialCells.slice();
        triggeredSpecial = true;
        this.grantTokens(1);
      }

      for (let step = 0; step < CONFIG.maxCascadeSteps; step += 1) {
        const runs = this.findMatchRuns(board);
        if (runs.length === 0 && pendingExplosions.length === 0) break;

        if (firstMatchSize === 0 && runs.length > 0) {
          firstMatchSize = Math.max(...runs.map(r => r.cells.length));
        }

        const clearSet = new Set();
        const creations = [];

        runs.forEach((run) => {
          run.cells.forEach(cell => clearSet.add(this.key(cell.r, cell.c)));
          if (run.cells.length >= 4) {
            const anchor = run.cells.some(cell => cell.r === meta.swapTo.r && cell.c === meta.swapTo.c)
              ? { ...meta.swapTo }
              : run.cells[0];
            const special = run.cells.length >= 5
              ? 'bomb'
              : (run.orientation === 'h' ? 'stripedH' : 'stripedV');
            creations.push({ ...anchor, color: run.color, special });
            clearSet.delete(this.key(anchor.r, anchor.c));
            if (!createdSpecial) createdSpecial = special;
            if (run.cells.length >= 5) this.grantTokens(2);
            else this.grantTokens(1);
          }
        });

        pendingExplosions.forEach(cell => clearSet.add(this.key(cell.r, cell.c)));
        pendingExplosions = [];

        const queue = [...clearSet];
        const expanded = new Set(clearSet);
        while (queue.length > 0) {
          const current = queue.pop();
          const { r, c } = this.parseKey(current);
          const tile = board[r][c];
          if (!tile || !tile.special) continue;
          const blast = this.explodeCellsForSpecial(r, c, tile.special);
          blast.forEach((cell) => {
            const k = this.key(cell.r, cell.c);
            if (!expanded.has(k)) {
              expanded.add(k);
              queue.push(k);
            }
          });
        }

        creations.forEach((creation) => expanded.delete(this.key(creation.r, creation.c)));

        const clearedColors = {};
        expanded.forEach((k) => {
          const { r, c } = this.parseKey(k);
          const tile = board[r][c];
          if (!tile) return;
          clearedColors[tile.color] = (clearedColors[tile.color] || 0) + 1;
          totalCleared += 1;
          board[r][c] = null;
        });

        creations.forEach((creation) => {
          board[creation.r][creation.c] = this.nextTile(creation.color, creation.special);
        });

        const scoreDeltaStep = (Object.values(clearedColors).reduce((sum, n) => sum + n, 0) * CONFIG.pointsPerTile)
          + (creations.length * 20);
        totalScoreDelta += scoreDeltaStep;

        objectiveDeltaTotal += this.objectiveDeltaFromClears(clearedColors, scoreDeltaStep);
        this.applyGravity(board);
      }

      return {
        matchSize: firstMatchSize,
        createdSpecial,
        triggeredSpecial,
        tilesCleared: totalCleared,
        scoreDelta: totalScoreDelta,
        objectiveProgressDelta: objectiveDeltaTotal
      };
    }

    findValidMoves(board) {
      const moves = [];
      const deltas = [{ dr: 0, dc: 1 }, { dr: 1, dc: 0 }];
      for (let r = 0; r < CONFIG.rows; r += 1) {
        for (let c = 0; c < CONFIG.cols; c += 1) {
          for (const d of deltas) {
            const rr = r + d.dr;
            const cc = c + d.dc;
            if (!this.inBounds(rr, cc)) continue;
            const tileA = board[r][c];
            const tileB = board[rr][cc];
            const sim = deepCloneBoard(board);
            this.swapCells(sim, { r, c }, { r: rr, c: cc });
            const hasRun = this.findMatchRuns(sim).length > 0;
            const validBySpecial = Boolean(tileA && tileA.special) || Boolean(tileB && tileB.special);
            if (hasRun || validBySpecial) {
              moves.push({ from: { r, c }, to: { r: rr, c: cc } });
            }
          }
        }
      }
      return moves;
    }

    estimateMove(move) {
      const sim = deepCloneBoard(this.state.board);
      const tileA = sim[move.from.r][move.from.c];
      const tileB = sim[move.to.r][move.to.c];
      this.swapCells(sim, move.from, move.to);

      let estimate = 0;
      const runs = this.findMatchRuns(sim);
      const clearSet = new Set();
      runs.forEach(run => run.cells.forEach(cell => clearSet.add(this.key(cell.r, cell.c))));
      estimate += clearSet.size;
      if (tileA && tileA.special) estimate += 6;
      if (tileB && tileB.special) estimate += 6;
      if (runs.some(r => r.cells.length >= 5)) estimate += 8;
      else if (runs.some(r => r.cells.length === 4)) estimate += 4;

      if (this.state.level.objectiveType === 'collect') {
        const target = this.state.level.targetColor;
        let targetInRuns = 0;
        clearSet.forEach((k) => {
          const { r, c } = this.parseKey(k);
          if (sim[r][c] && sim[r][c].color === target) targetInRuns += 1;
        });
        estimate += targetInRuns * 3;
      } else {
        estimate += clearSet.size;
      }

      return estimate;
    }

    bestMove() {
      const moves = this.findValidMoves(this.state.board);
      if (moves.length === 0) return null;
      let best = null;
      let bestScore = -Infinity;
      moves.forEach((move) => {
        const score = this.estimateMove(move);
        if (score > bestScore) {
          bestScore = score;
          best = move;
        }
      });
      return best;
    }

    checkNoMovesAndAutoShuffle() {
      if (this.findValidMoves(this.state.board).length > 0) return;
      const beforeHash = this.boardHash(this.state.board);
      this.shuffleBoard();
      this.state.streak = 0;
      this.state.levelStats.autoShuffles += 1;
      this.logEvent({
        type: 'tool_used',
        toolType: 'AutoShuffle',
        costType: 'none',
        costValue: 0,
        timestampIso: nowIso(),
        boardHashBefore: beforeHash,
        boardHashAfter: this.boardHash(this.state.board)
      });
      this.setBanner('No valid moves. Auto-shuffled.');
    }

    handleTileClick(r, c) {
      if (this.state.pendingTool === 'convert-await-tile') {
        this.state.convertTarget = { r, c };
        this.state.pendingTool = 'convert-await-color';
        this.render();
        this.setBanner('Choose a color to convert this tile.');
        return;
      }

      if (this.state.pendingTool === 'convert-await-color') {
        this.state.convertTarget = { r, c };
        this.render();
        return;
      }

      const selected = this.state.selectedCell;
      if (!selected) {
        this.state.selectedCell = { r, c };
        this.renderBoard();
        return;
      }

      if (selected.r === r && selected.c === c) {
        this.state.selectedCell = null;
        this.renderBoard();
        return;
      }

      if (!this.areAdjacent(selected, { r, c })) {
        this.state.selectedCell = { r, c };
        this.renderBoard();
        return;
      }

      this.attemptMove(selected, { r, c });
      this.state.selectedCell = null;
      this.render();
    }

    captureSnapshot() {
      return {
        board: deepCloneBoard(this.state.board),
        score: this.state.score,
        movesRemaining: this.state.movesRemaining,
        bankTokens: this.state.bankTokens,
        objectiveProgress: this.state.objectiveProgress,
        streak: this.state.streak,
        moveIndex: this.state.moveIndex
      };
    }

    attemptMove(from, to) {
      const board = this.state.board;
      const before = {
        score: this.state.score,
        moves: this.state.movesRemaining,
        tokens: this.state.bankTokens,
        streak: this.state.streak,
        objective: this.state.objectiveProgress,
        boardHash: this.boardHash(board)
      };

      const tileFromBefore = board[from.r][from.c] ? { ...board[from.r][from.c] } : null;
      const tileToBefore = board[to.r][to.c] ? { ...board[to.r][to.c] } : null;

      this.swapCells(board, from, to);
      const validByMatch = this.findMatchRuns(board).length > 0;
      const validBySpecial = Boolean(tileFromBefore && tileFromBefore.special) || Boolean(tileToBefore && tileToBefore.special);
      if (!validByMatch && !validBySpecial) {
        this.swapCells(board, from, to);
        this.setBanner('Invalid swap. Try another move.');
        return;
      }

      if (this.state.movesRemaining <= 0) return;
      this.state.lastSnapshot = this.captureSnapshot();
      this.state.movesRemaining -= 1;
      this.state.moveIndex += 1;
      this.state.levelStats.movesMade += 1;

      const specialCells = [];
      if (tileFromBefore && tileFromBefore.special) specialCells.push({ ...to });
      if (tileToBefore && tileToBefore.special) specialCells.push({ ...from });

      const result = this.resolveBoardAfterAction({ swapTo: to, playerTriggeredSpecialCells: specialCells });
      this.state.score += result.scoreDelta;
      this.state.objectiveProgress += result.objectiveProgressDelta;

      const advancedObjective = result.objectiveProgressDelta > 0;
      if (advancedObjective) {
        this.state.streak += 1;
      } else {
        this.state.streak = 0;
        this.state.streakBreaks += 1;
        this.state.levelStats.nonObjectiveMoves += 1;
      }
      this.state.streakMax = Math.max(this.state.streakMax, this.state.streak);

      if (this.state.streak === 3) this.grantTokens(1);
      if (this.state.streak === 5) this.spawnStripedGrant();
      if (this.state.streak === 7) this.grantTokens(2);

      const now = performance.now();
      const moveTime = Math.max(0, now - this.lastMoveAtMs);
      this.lastMoveAtMs = now;
      this.state.levelStats.totalMoveTimeMs += moveTime;
      this.state.levelStats.objectiveProgressPerMove.push(result.objectiveProgressDelta);

      this.logEvent({
        type: 'move_made',
        moveIndex: this.state.moveIndex,
        timestampIso: nowIso(),
        timeSinceLastMoveMs: Math.round(moveTime),
        swapFrom: from,
        swapTo: to,
        matchSize: result.matchSize,
        createdSpecial: result.createdSpecial,
        triggeredSpecial: result.triggeredSpecial,
        tilesCleared: result.tilesCleared,
        objectiveProgressDelta: result.objectiveProgressDelta,
        scoreDelta: result.scoreDelta,
        bankTokensBefore: before.tokens,
        bankTokensAfter: this.state.bankTokens,
        movesRemainingBefore: before.moves,
        movesRemainingAfter: this.state.movesRemaining,
        streakBefore: before.streak,
        streakAfter: this.state.streak
      });

      if (this.state.freeHintTurns > 0) {
        this.showBestHint();
        this.state.freeHintTurns = Math.max(0, this.state.freeHintTurns - 1);
      } else {
        this.state.hintPair = null;
      }

      this.checkNoMovesAndAutoShuffle();
      this.evaluateLevelEnd();
    }

    spawnStripedGrant() {
      const empties = [];
      for (let r = 0; r < CONFIG.rows; r += 1) {
        for (let c = 0; c < CONFIG.cols; c += 1) {
          if (this.state.board[r][c] && !this.state.board[r][c].special) {
            empties.push({ r, c });
          }
        }
      }
      if (empties.length === 0) return;
      const pick = empties[Math.floor(this.rng() * empties.length)];
      const tile = this.state.board[pick.r][pick.c];
      tile.special = this.rng() > 0.5 ? 'stripedH' : 'stripedV';
      this.setBanner('Streak reward: Striped tile granted!');
    }

    useTool(toolType) {
      if (this.state.ended) return;
      if (toolType === 'addMove') return this.toolAddMove();
      if (toolType === 'convert') return this.toolStartConvert();
      if (toolType === 'shuffle') return this.toolShuffle();
      if (toolType === 'stabilise') return this.toolStabilise();
      if (toolType === 'hint') return this.toolHint();
      if (toolType === 'undo') return this.toolUndo();
    }

    toolAddMove() {
      if (this.state.addMovesUsed >= CONFIG.maxAddMovesPerLevel) return this.setBanner('Add Move cap reached (+5).');
      if (!this.spendTokens(CONFIG.costs.addMove)) return this.setBanner('Need 2 tokens.');
      const beforeHash = this.boardHash(this.state.board);
      this.state.movesRemaining += 1;
      this.state.addMovesUsed += 1;
      this.state.levelStats.addMovesUsed += 1;
      this.logTool('AddMove', 'tokens', CONFIG.costs.addMove, beforeHash, beforeHash);
      this.render();
    }

    toolStartConvert() {
      if (this.state.pendingTool && this.state.pendingTool.startsWith('convert')) {
        this.state.pendingTool = null;
        this.state.convertTarget = null;
        this.setBanner('Convert cancelled.');
      } else {
        if (this.state.bankTokens < CONFIG.costs.convertTile) return this.setBanner('Need 2 tokens.');
        this.state.pendingTool = 'convert-await-tile';
        this.state.convertTarget = null;
        this.setBanner('Select a tile to convert.');
      }
      this.render();
    }

    applyConvertTile(color) {
      const target = this.state.convertTarget;
      if (!target) return;
      const boardHashBefore = this.boardHash(this.state.board);
      if (!this.spendTokens(CONFIG.costs.convertTile)) return this.setBanner('Need 2 tokens.');

      const tile = this.state.board[target.r][target.c];
      if (!tile) return;
      tile.color = color;
      tile.special = null;
      this.state.pendingTool = null;
      this.state.convertTarget = null;
      this.state.levelStats.convertsUsed += 1;
      this.logTool('ConvertTile', 'tokens', CONFIG.costs.convertTile, boardHashBefore, this.boardHash(this.state.board));

      this.checkNoMovesAndAutoShuffle();
      this.render();
    }

    toolShuffle() {
      if (!this.spendTokens(CONFIG.costs.shuffle)) return this.setBanner('Need 3 tokens.');
      const beforeHash = this.boardHash(this.state.board);
      this.shuffleBoard();
      this.state.streak = 0;
      this.state.streakBreaks += 1;
      this.state.levelStats.shufflesUsed += 1;
      this.logTool('Shuffle', 'tokens', CONFIG.costs.shuffle, beforeHash, this.boardHash(this.state.board));
      this.render();
    }

    shuffleBoard() {
      const specials = [];
      for (let r = 0; r < CONFIG.rows; r += 1) {
        for (let c = 0; c < CONFIG.cols; c += 1) {
          if (this.state.board[r][c] && this.state.board[r][c].special) {
            specials.push({ r, c, special: this.state.board[r][c].special });
          }
        }
      }

      let board = this.generatePlayableBoard();
      specials.forEach((sp) => {
        board[sp.r][sp.c].special = sp.special;
      });

      let guard = 0;
      while ((this.findMatchRuns(board).length > 0 || this.findValidMoves(board).length === 0) && guard < 200) {
        board = this.generatePlayableBoard();
        guard += 1;
      }
      this.state.board = board;
    }

    toolStabilise() {
      if (!this.spendTokens(CONFIG.costs.stabilise)) return this.setBanner('Need 3 tokens.');
      const beforeHash = this.boardHash(this.state.board);
      this.state.levelStats.stabiliseUsed += 1;
      this.state.freeHintTurns = 1;
      this.showBestHint();
      this.logTool('Stabilise', 'tokens', CONFIG.costs.stabilise, beforeHash, beforeHash);
      this.setBanner('Stabilise active: best move highlighted for one turn.');
      this.render();
    }

    toolHint() {
      if (this.state.movesRemaining < CONFIG.costs.hintMoves) return this.setBanner('Not enough moves for Hint.');
      const beforeHash = this.boardHash(this.state.board);
      this.state.movesRemaining -= CONFIG.costs.hintMoves;
      this.state.levelStats.hintsUsed += 1;
      this.showBestHint();
      this.logTool('Hint', 'moves', CONFIG.costs.hintMoves, beforeHash, beforeHash);
      this.evaluateLevelEnd();
      this.render();
    }

    toolUndo() {
      if (this.state.undoUsed) return this.setBanner('Undo already used this level.');
      if (!this.state.lastSnapshot) return this.setBanner('No move to undo yet.');
      if (this.state.movesRemaining < CONFIG.costs.undoMoves) return this.setBanner('Need 2 moves for Undo.');

      const beforeHash = this.boardHash(this.state.board);
      const snap = this.state.lastSnapshot;
      this.state.board = deepCloneBoard(snap.board);
      this.state.score = snap.score;
      this.state.movesRemaining = snap.movesRemaining - CONFIG.costs.undoMoves;
      this.state.bankTokens = snap.bankTokens;
      this.state.objectiveProgress = snap.objectiveProgress;
      this.state.streak = snap.streak;
      this.state.moveIndex = snap.moveIndex;
      this.state.undoUsed = true;
      this.state.levelStats.undosUsed += 1;
      this.logTool('Undo', 'moves', CONFIG.costs.undoMoves, beforeHash, this.boardHash(this.state.board));
      this.render();
    }

    showBestHint() {
      const best = this.bestMove();
      this.state.hintPair = best ? [best.from, best.to] : null;
      if (!best) this.setBanner('No hint available right now.');
    }

    logTool(toolType, costType, costValue, boardHashBefore, boardHashAfter) {
      this.logEvent({
        type: 'tool_used',
        toolType,
        costType,
        costValue,
        timestampIso: nowIso(),
        boardHashBefore,
        boardHashAfter
      });
    }

    evaluateLevelEnd() {
      if (this.state.ended) return;

      const success = this.objectiveMet();
      const outOfMoves = this.state.movesRemaining <= 0;
      if (!success && !outOfMoves) return;

      this.state.ended = true;
      const stars = success ? this.computeStars() : 0;
      const derived = this.buildDerivedMetrics();
      const summary = {
        sessionId: this.sessionId,
        levelId: this.state.level.id,
        objectiveType: this.state.level.objectiveType,
        success,
        finalScore: this.state.score,
        stars,
        movesMade: this.state.levelStats.movesMade,
        moveBudget: this.state.level.moveBudget,
        movesRemaining: this.state.movesRemaining,
        objectiveProgress: this.state.objectiveProgress,
        tokenEarned: this.state.levelStats.tokensEarned,
        tokenSpent: this.state.levelStats.tokensSpent,
        hintsUsed: this.state.levelStats.hintsUsed,
        undosUsed: this.state.levelStats.undosUsed,
        shufflesUsed: this.state.levelStats.shufflesUsed,
        convertsUsed: this.state.levelStats.convertsUsed,
        addMovesUsed: this.state.levelStats.addMovesUsed,
        stabiliseUsed: this.state.levelStats.stabiliseUsed,
        autoShuffles: this.state.levelStats.autoShuffles,
        streakMax: this.state.streakMax,
        streakBreaks: this.state.streakBreaks,
        objectiveProgressPerMove: derived.objectiveProgressPerMove,
        nonObjectiveMoveRate: derived.nonObjectiveMoveRate,
        avgTimePerMoveMs: derived.avgTimePerMoveMs
      };
      this.levelSummaries.push(summary);

      this.logEvent({
        type: 'level_end',
        levelId: this.state.level.id,
        success,
        finalScore: this.state.score,
        stars,
        totals: {
          hintsUsed: this.state.levelStats.hintsUsed,
          undosUsed: this.state.levelStats.undosUsed,
          shufflesUsed: this.state.levelStats.shufflesUsed,
          convertsUsed: this.state.levelStats.convertsUsed,
          addMovesUsed: this.state.levelStats.addMovesUsed
        },
        derivedMetrics: derived,
        timestampIso: nowIso()
      });

      this.persistLastRun();
      this.showEndModal(success, stars, derived);
    }

    computeStars() {
      const level = this.state.level;
      const moveRatio = this.state.movesRemaining / Math.max(1, level.moveBudget);
      if (!this.objectiveMet()) return 0;
      let stars = 1;
      if (moveRatio >= 0.2 || this.state.score >= level.star2Score) stars = 2;
      if (moveRatio >= 0.35 || this.state.score >= level.star3Score) stars = 3;
      return stars;
    }

    buildDerivedMetrics() {
      const moves = Math.max(1, this.state.levelStats.movesMade);
      const objectiveProgressPerMove = this.state.levelStats.objectiveProgressPerMove.join('|');
      return {
        objectiveProgressPerMove,
        nonObjectiveMoveRate: Number((this.state.levelStats.nonObjectiveMoves / moves).toFixed(3)),
        avgTimePerMoveMs: Math.round(this.state.levelStats.totalMoveTimeMs / moves)
      };
    }

    showEndModal(success, stars, derived) {
      const modal = this.rootEl.querySelector('#emv0-end-modal');
      const title = this.rootEl.querySelector('#emv0-end-title');
      const summary = this.rootEl.querySelector('#emv0-end-summary');
      const starsEl = this.rootEl.querySelector('#emv0-end-stars');
      const metrics = this.rootEl.querySelector('#emv0-end-metrics');
      const nextBtn = this.rootEl.querySelector('#emv0-next-level');

      title.textContent = success ? 'Level Complete!' : 'Level Failed';
      summary.textContent = success
        ? `Great run. You finished ${this.state.level.name} with ${stars} star${stars === 1 ? '' : 's'}.`
        : 'No moves left. Try again with better tool timing.';
      starsEl.textContent = success ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '☆☆☆';
      metrics.innerHTML = `
        <div><span>Score</span><strong>${this.state.score}</strong></div>
        <div><span>Moves Left</span><strong>${this.state.movesRemaining}</strong></div>
        <div><span>Max Streak</span><strong>${this.state.streakMax}</strong></div>
        <div><span>Avg Time / Move</span><strong>${derived.avgTimePerMoveMs} ms</strong></div>
      `;

      nextBtn.disabled = this.state.levelIndex >= LEVELS_V0.length - 1;
      modal.hidden = false;
    }

    hideEndModal() {
      this.rootEl.querySelector('#emv0-end-modal').hidden = true;
    }

    setBanner(message) {
      const el = this.rootEl.querySelector('#emv0-banner');
      el.textContent = message || '';
    }

    render() {
      const level = this.state.level;
      const objectiveText = level.objectiveType === 'score'
        ? `Score ${this.state.score}/${level.scoreTarget}`
        : `Collect ${level.collectTarget} ${level.targetColor} (${this.state.objectiveProgress}/${level.collectTarget})`;

      this.rootEl.querySelector('#emv0-objective-text').textContent = objectiveText;
      this.rootEl.querySelector('#emv0-moves').textContent = String(this.state.movesRemaining);
      this.rootEl.querySelector('#emv0-tokens').textContent = String(this.state.bankTokens);
      this.rootEl.querySelector('#emv0-score').textContent = String(this.state.score);
      this.rootEl.querySelector('#emv0-streak').textContent = String(this.state.streak);

      const convertPanel = this.rootEl.querySelector('#emv0-convert-panel');
      convertPanel.hidden = !(this.state.pendingTool && this.state.pendingTool.startsWith('convert'));
      this.rootEl.querySelector('#emv0-color-choices').innerHTML = CONFIG.colors.map(color => (
        `<button class="emv0-color-btn emv0-${color}" data-color="${color}">${color}</button>`
      )).join('');

      this.rootEl.querySelectorAll('[data-tool]').forEach((btn) => {
        const tool = btn.getAttribute('data-tool');
        if (tool === 'undo') {
          btn.disabled = this.state.undoUsed || !this.state.lastSnapshot || this.state.movesRemaining < CONFIG.costs.undoMoves;
        }
      });

      this.renderBoard();
    }

    renderBoard() {
      const boardEl = this.rootEl.querySelector('#emv0-board');
      const selected = this.state.selectedCell;
      const hint = this.state.hintPair || [];

      boardEl.innerHTML = this.state.board.map((row, r) => row.map((tile, c) => {
        const classes = ['emv0-tile', `emv0-${tile.color}`];
        const isSelected = selected && selected.r === r && selected.c === c;
        const isHint = hint.some(cell => cell.r === r && cell.c === c);
        const isConvertTarget = this.state.convertTarget && this.state.convertTarget.r === r && this.state.convertTarget.c === c;
        if (isSelected) classes.push('is-selected');
        if (isHint) classes.push('is-hint');
        if (isConvertTarget) classes.push('is-convert-target');

        const badge = tile.special === 'bomb'
          ? '💣'
          : tile.special === 'stripedH'
            ? '⇄'
            : tile.special === 'stripedV'
              ? '⇅'
              : '';

        return `<button class="${classes.join(' ')}" data-r="${r}" data-c="${c}"><span>${badge}</span></button>`;
      }).join('')).join('');
    }

    logEvent(event) {
      this.events.push(event);
      this.persistLastRun();
    }

    persistLastRun() {
      const payload = {
        sessionId: this.sessionId,
        seed: this.seed,
        updatedAtIso: nowIso(),
        events: this.events,
        levels: this.levelSummaries
      };
      localStorage.setItem('earnieMatchV0:lastRun', JSON.stringify(payload));
    }

    downloadTelemetryJson() {
      const payload = {
        sessionId: this.sessionId,
        seed: this.seed,
        generatedAtIso: nowIso(),
        events: this.events,
        levels: this.levelSummaries
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      this.downloadBlob(blob, `earnieMatchV0-telemetry-${Date.now()}.json`);
    }

    downloadCsvSummary() {
      const headers = [
        'sessionId', 'levelId', 'objectiveType', 'success', 'finalScore', 'stars',
        'movesMade', 'moveBudget', 'movesRemaining', 'objectiveProgress',
        'hintsUsed', 'undosUsed', 'shufflesUsed', 'convertsUsed', 'addMovesUsed', 'stabiliseUsed', 'autoShuffles',
        'tokenEarned', 'tokenSpent', 'streakMax', 'streakBreaks',
        'objectiveProgressPerMove', 'nonObjectiveMoveRate', 'avgTimePerMoveMs'
      ];

      const lines = [headers.join(',')];
      this.levelSummaries.forEach((row) => {
        const vals = headers.map((h) => {
          const v = row[h] ?? '';
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        });
        lines.push(vals.join(','));
      });

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, `earnieMatchV0-levels-${Date.now()}.csv`);
    }

    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  function mountEarnieMatchV0() {
    const existing = document.getElementById('earnie-match-root');
    if (existing) {
      new EarnieMatchV0(existing);
      return;
    }

    const main = document.querySelector('main') || document.body;
    const root = document.createElement('div');
    root.id = 'earnie-match-root';
    main.appendChild(root);
    new EarnieMatchV0(root);
  }

  document.addEventListener('DOMContentLoaded', mountEarnieMatchV0);
})();
