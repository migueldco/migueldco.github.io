---
title: 'Rerooting tutorial'
description: 'This article explains how rerooting works, with examples.'
author: 'Miguel'
date: '11/21/2025'
tags: ['competitive-programming', 'tree-algorithms', 'tutorial']
---

# Basic example

Sometimes a problem involves computing something about the subtree of a node based on some information you have about each child's subtree. 
A simple example of this is the problem [Tree Distances II from CSES](https://cses.fi/problemset/task/1133).

In this problem, you are asked to compute for each node, the sum of tree distances from that node to every other node.
As you might have guessed, since this is about rerooting, we will turn this into a subtree problem, and then find a way to reroot the tree.

Let's root the tree at an arbitrary vertex $r$, and let
$$
    \text{dp}[v] = \text{ sum of the distances from every vertex in the subtree of } v \text{ to } v
$$
Then, after some calculations, we find that
$$
    \text{dp}[v] = \sum\limits_{u \text{ is a child of } v} (\text{dp}[u] + \text{size}[u])
$$
Where $\text{size}[u]$ is the number of vertices in the subtree of $u$.

Now, clearly $\text{dp}[r]$ is the answer to the problem for $r$. So we just need to find a way to reroot into each of the other vertices.
Here is one way to do it:

```cpp
auto dfs = [&](auto &&self, int x, int par, i64 sum) -> void {
    ans[x] = dp[x] + sum + (n - size[x]);
    for (int y: adj[x]) if (y != par) {
        self(self, y, x, ans[x] - dp[y] - size[y]);
    }
};
```

# Another example

Let's solve [this problem](https://qoj.ac/contest/1821/problem/9539).

Short statement: You are given a tree with $N$ vertices and $Q$ queries. 
In each query you are given two vertices $a$ and $b$, and you are asked in how many ways you can remove some connected set of vertices from the tree in such a way that $a$ and $b$ are disconnected (or are  removed from the graph).

There are probably many ways to solve this problem, so I will show you how I did it.
Well, to make $a$ and $b$ disconnected, it is enough to remove any vertex from the path between $a$ and $b$, so let's find a way to count that without overcounting or undercounting.

Let's consider the LCA of $a$ and $b$. If the set doesn't include the LCA, then it must include some other vertices, one of which must be the highest in the tree.
Let's say that 
$$
    \text{dp}[v] = \text{ number of ways to remove a connected set from the subtree of } v
$$ 
Then it's not hard to see that
$$
    \text{dp}[v] = \prod\limits_{u \text{ is a child of } v} (\text{dp}[u] + 1)
$$
For each vertex $v$ in the path from $a$ to $b$ (except for the LCA), the number of ways to remove a connected set of vertices such that $v$ is the highest vertex is clearly $\text{dp}[v]$.
That's the contribution of vertex $v$, so we just need to find the path sum of $\text{dp}[v]$. Now we also need to count how many sets include the LCA.

To do that, notice that this is the same as calculating $\text{dp}[\text{LCA}(a, b)]$, except you can also add some vertices above the LCA... that's where rerooting comes in! You reroot the tree until the LCA is the new root, and then you can find what the value of $\text{dp}[\text{LCA}]$ would be.

Here is the core of my implementation for this problem.
```cpp
void solve() {
	int n, q;
	cin >> n >> q;
	Tree t(n);
	for (int i = 1; i < n; i++) {
		int p;
		cin >> p;
		--p;
		t.addEdge(p, i);
	}
	t.build();
	TreeMove tmv(t);
	VI ans(q);
	VVI qs(n), qp(n);
	for (int i = 0; i < q; i++) {
		int a, b;
		cin >> a >> b;
		a--,b--;
		qs[tmv.lca(a, b)].push_back(i);
		qp[a].push_back(i);
		qp[b].push_back(i);
	}
	vector<i64> dp(n);
	{
		auto dfs = [&](auto &&self, int x) -> void {
			dp[x] = 1;
			for (int y: t.adj[x]) if (y != t.par[x]) {
				self(self, y);
				dp[x] = dp[x] * (dp[y] + 1) % MOD;
			}
		};
		dfs(dfs, 0);
	}
	{
		auto dfs = [&](auto &&self, int x, i64 acc, i64 sum) -> void {
			sum = (sum + dp[x]) % MOD;
			for (int i: qs[x]) {
				ans[i] -= 2 * sum;
				ans[i] %= MOD;
				if (ans[i] < 0) ans[i] += MOD;
				ans[i] += dp[x] * (acc + 1) % MOD;
				ans[i] %= MOD;
			}
			for (int i: qp[x]) {
				ans[i] = (ans[i] + sum) % MOD;
			}
			auto adj = t.adj[x];
			if (t.par[x] != x) adj.erase(find(adj.begin(), adj.end(), t.par[x]));
			int d = adj.size();
			vector<i64> mul(d, 1);
			for (int i = 0, a = 1; i < d; i++) {
				mul[i] = mul[i] * a % MOD;
				a = a * (dp[adj[i]] + 1) % MOD;
			}
			for (int i = d - 1, a = 1; i >= 0; i--) {
				mul[i] = mul[i] * a % MOD;
				a = a * (dp[adj[i]] + 1) % MOD;
			}
			for (int i = 0; i < d; i++) {
				int y = adj[i];
				self(self, y, mul[i] * (acc + 1) % MOD, sum);
			}
		};
		dfs(dfs, 0, 0, 0);
	}
	for (int i = 0; i < q; i++) {
		cout << ans[i] << endl;
	}
}
```
