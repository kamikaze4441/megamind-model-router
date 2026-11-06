# Credits and third-party notices

## donimas/ai-routing (MIT)

The four worker agents (`scout`, `runner`, `builder`, `reviewer`) adapt the wording of the `code-searcher`, `test-runner`,
`implementer` and `reviewer` agents, and the spawn guard follows the idea of `require-subagent-model.py`, from
[donimas/ai-routing](https://github.com/donimas/ai-routing) at commit `4a8312fffdd0760f7110b592728594a163d6ec05`
(2026-11-06). Its licence notice:

    MIT License
    
    Copyright (c) 2026 donimas
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    
    by @donimas · AI Levels series

## Ideas only (no text or code copied)

- The brief-and-check loop (every worker brief ends with a "Done when:" check that the orchestrator re-runs) comes from
  the Omega guide on murphmaxxing.com (`/vault/omega-agent-orchestration`, read 2026-11-06). The page has no licence, so
  only the idea is used.
- Where cheap workers help and where they don't: r/ClaudeAI posts 1x1nsaz (2026-10-09) and 1xn0e12 (2026-11-03), cited in
  the README with their scores.
