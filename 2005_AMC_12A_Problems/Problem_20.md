# 2005 AMC 12A Problem 20

## Problem
For each x in [0,1], define


$$
f(x) = \begin{cases} 2x, \qquad\qquad \mathrm{if} \quad 0 \leq x \leq \frac{1}{2}\\ 2-2x, \qquad \mathrm{if} \quad \frac{1}{2} < x \leq 1. \end{cases}
$$


Let $f^{[2]}(x)$ = f(f(x)), and $f^{[n + 1]}(x) = f^{[n]}$(f(x)) for each integer n $\geq 2.$ For how many values of x in [0,1] is $f^{[2005]}(x) = 1/2$?


$$(\mathrm {A}) \ 0 \qquad (\mathrm {B}) \ 2005 \qquad (\mathrm {C})\ 4010 \qquad (\mathrm {D}) \ 2005^2 \qquad (\mathrm {E})\ 2^{2005}$$

## Solution 1
For the two functions $f(x)=2x,0\lex\le \frac{1}{2}$ and $f(x)=2-2x,\frac{1}{2}\lex\le 1,a$s long as f(x) is between 0 and 1, x will be in the right domain, so we don't need to worry about the domain of x.

Also, every time we change f(x), the expression for the final answer in terms of x will be in a different form (although they'll all satisfy the final equation), so we get a different starting value of x.  Every time we have two choices for f(x) and altogether we have to choose 2005 times. Thus, $2^{2005}\Rightarrow\boxed{E}.$

Note: the values of x that satisfy $f^{[n]}(x) = \frac$ {1}{2} are $\frac{1}{2^{n+1}}, \frac{3}{2^{n+1}}, \frac{5}{2^{n+1}}, \cdots$ ,$\frac{2^{n+1}-1}{2^{n+1}}.$
## Solution 2 (Engineers Induction)
We are given that $f^{[2005]}(x) = \frac$ {1}{2}. Thus,  f($f^{[2004]}(x))=\frac{1}{2}.$ Let $f^{[2004]}(x)$ be equal to y. Thus f(y)=$\frac{1}{2}$ or $y=\frac{1}{4}$ or $\frac{3}{4}.$ Now we know $f^{[2004]}(x)$ is equal to $\frac{1}{4}$ or $\frac{3}{4}.$ Now we know that f($f^{[2003]}(x))=\frac{1}{4}$ or $\frac{3}{4}.$ Now we solve for $f^{[2003]}(x)$ and let  $f^{[2003]}(x)$=z. Thus f(z) is equal to $\frac{1}{8},\frac{7}{8},\frac{5}{8},a$nd $\frac{3}{8}.$ As we see, $f^{[2005]}(x)$ has 1 solution, $f^{[2004]}(x)$ has 2 solutions, and $f^{[2003]}(x)$ has 4 solutions. Thus for each iteration we double the number of possible solutions. There are 2005 iterations and thus the number of solutions is $2^{2005}\Rightarrow\boxed{E}$
## See Also
