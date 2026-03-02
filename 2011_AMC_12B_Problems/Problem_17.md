# 2011 AMC 12B Problem 17

## Problem
Let f(x) = $10^{10x}$, g(x) = $\log_{10}\left(\frac{x}{10}\right),h_1(x)$ = g(f(x)), and $h_n(x) = h_1(h_{n-1}(x)$) for integers n $\geq 2.$ What is the sum of the digits of $h_{2011}(1)$?

$\textbf{(A)}\ 16081 \qquad \textbf{(B)}\ 16089 \qquad \textbf{(C)}\ 18089 \qquad \textbf{(D)}\ 18098 \qquad \textbf{(E)}\ 18099$
## Solution
$$g(x)=\log_{10}\left(\frac{x}{10}\right)=\log_{10}\left({x}\right) - 1$$


$$h_{1}(x)=g(f(x))\text{ = }g(10^{10x})=\log_{10}\left({10^{10x}}\right){ - 1 = 10x - 1}$$


Proof by induction that $h_{n}(x)\text{ = }10^nx - (1 + 10 + 10^2 + ... +10^{n-1}$):

For $n=1, h_{1}(x)=10x - 1$

Assume $h_{n}(x)=10^n x - (1 + 10 + 10^2 + ... +10^{n-1}$) is true for n:


$$
\begin{align*} h_{n+1}(x)&= h_{1}(h_{n}(x))\\ &=10 h_{n}(x) - 1\\ &=10 (10^n x - (1 + 10 + 10^2 + ... + 10^{n-1})) - 1\\ &= 10^{n+1} x - (10 + 10^2 + ... + 10^{n}) - 1\\ &= 10^{n+1} x - (1 + 10 + 10^2 + ... + 10^{(n+1)-1}) \end{align*}
$$


Therefore, if it is true for n, then it is true for $n+1$; since it is also true for $n = 1$, it is true for all positive integers n.

$h_{2011}(1) = 10^{2011}\times 1{ - }(1 + 10 + 10^2 +$ ... + $10^{2010}$), which is the 2011-digit number 8888...8889

The sum of the digits is 8 times 2010 plus 9, or $\boxed{16089\textbf{(B)}}$
## Solution 2 (Quick, Non-Rigorous Trends)
As before, $h_1(x)=10x-1$. Compute $h_1(x), h_2(x)$, and $h_3(x)$ to yield 9, 89, and 889. Notice how this trend will repeat this trend (multiply by 10, subtract 1, repeat). As such, $h_{2011}$ is just 2010 8's followed by a nine. $2010(8)+9=\boxed{\textbf{B)}16089}.$

~~BJHHar
## See also
