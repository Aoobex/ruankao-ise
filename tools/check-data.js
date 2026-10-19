/* 数据自检：node tools/check-data.js
   校验题库/卡片/案例格式，并统计答案分布、各模块题量。不修改任何文件。 */
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'data');
const FILES = fs.readdirSync(DATA).filter(f => f.endsWith('.js')).sort();

global.window = {};
FILES.forEach(f => require(path.join(DATA, f)));

const modules = window.RK_DATA.modules || [];
const questions = window.RK_DATA.questions || [];
const cases = window.RK_CASES || [];
const problems = [];

const ids = new Set();
questions.forEach(q => {
  if (ids.has(q.id)) problems.push('重复题号 ' + q.id);
  ids.add(q.id);
  if (!q.q || !q.e || !q.tag || !q.m) problems.push('字段缺失 ' + q.id);
  if (!Array.isArray(q.o) || q.o.length !== 4) problems.push('选项不是4个 ' + q.id);
  else if (new Set(q.o).size !== 4) problems.push('选项重复 ' + q.id);
  if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) problems.push('答案下标非法 ' + q.id);
  if (!modules.some(m => m.id === q.m)) problems.push('未知模块 ' + q.m + ' (' + q.id + ')');
});
modules.forEach(m => {
  if (!m.cards || !m.cards.length) problems.push('模块没有卡片 ' + m.id);
  if (!questions.some(q => q.m === m.id) && m.id !== 'case') problems.push('模块没有题目 ' + m.id);
  m.cards.forEach((c, i) => {
    if (!c.t || !Array.isArray(c.b) || !c.b.length) problems.push('卡片内容缺失 ' + m.id + '#' + i);
  });
});
cases.forEach(c => {
  const sum = c.qs.reduce((a, q) => a + q.points.reduce((x, p) => x + p.s, 0), 0);
  if (sum !== c.score) problems.push('案例分值不符 ' + c.id + ' 采分点合计 ' + sum + ' ≠ ' + c.score);
  c.qs.forEach(q => { if (!q.ans) problems.push('案例缺参考答案 ' + c.id); });
});

if (problems.length) {
  console.error('✗ 发现 ' + problems.length + ' 个问题：\n  ' + problems.join('\n  '));
  process.exit(1);
}

const dist = [0, 0, 0, 0];
questions.forEach(q => dist[q.a]++);
const pct = dist.map(x => Math.round(x / questions.length * 100) + '%').join(' / ');
console.log('✓ 数据校验通过');
console.log('  模块 ' + modules.length + ' 个，卡片 ' + modules.reduce((s, m) => s + m.cards.length, 0) + ' 张，选择题 ' + questions.length + ' 道，案例 ' + cases.length + ' 道');
console.log('  答案分布 A/B/C/D：' + pct + (Math.max(...dist) / questions.length > 0.4 ? '  ← 偏斜，建议打散' : ''));
console.log('  各模块题量：' + modules.map(m => m.name + ' ' + questions.filter(q => q.m === m.id).length).join(' | '));
console.log('  文件：' + FILES.join(', '));
