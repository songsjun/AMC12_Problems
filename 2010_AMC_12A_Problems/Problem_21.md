# 2010 AMC 12A Problem 21

## Problem
The graph of $y=x^6-10x^5+29x^4-4x^3+ax^2$ lies above the line y=bx+c except at three values of x, where the graph and the line intersect. What is the largest of these values?

$\textbf{(A)}\ 4 \qquad \textbf{(B)}\ 5 \qquad \textbf{(C)}\ 6 \qquad \textbf{(D)}\ 7 \qquad \textbf{(E)}\ 8$
## Solutions
### Solution 1
The x values in which $y=x^6-10x^5+29x^4-4x^3+ax^2$ intersect at y=bx+c are the same as the zeros of $y=x^6-10x^5+29x^4-4x^3+ax^2-bx-c.$

Since there are 3 zeros and the function is never negative, all 3 zeros must be double roots because the function's degree is 6.

Suppose we let p, q, and r be the roots of this function, and let $x^3-ux^2+vx-w$ be the cubic polynomial with roots p, q, and r.


$$
\begin{align*}(x-p)(x-q)(x-r) &= x^3-ux^2+vx-w\\ (x-p)^2(x-q)^2(x-r)^2 &= x^6-10x^5+29x^4-4x^3+ax^2-bx-c = 0\\ \sqrt{x^6-10x^5+29x^4-4x^3+ax^2-bx-c} &= x^3-ux^2+vx-w = 0\end{align*}
$$


In order to find $\sqrt{x^6-10x^5+29x^4-4x^3+ax^2-bx-c}$ we must first expand out the terms of $(x^3-ux^2+vx-w)^2.$

$$(x^3-ux^2+vx-w)^2$$
$= x^6-2ux^5+(u^2+2v)x^4-(2uv+2w$)x^3+(2uw+v^2)x^2-2vwx+w^2

[Quick note: Since we don't know a, b, and c, we really don't even need the last 3 terms of the expansion.]


$$
\begin{align*}&2u = 10\\ u^2+2v &= 29\\ 2uv+2w &= 4\\ u &= 5\\ v &= 2\\ w &= -8\\ &\sqrt{x^6-10x^5+29x^4-4x^3+ax^2-bx-c} = x^3-5x^2+2x+8\end{align*}
$$


All that's left is to find the largest root of $x^3-5x^2+2x+8$.


$$
\begin{align*}&x^3-5x^2+2x+8 = (x-4)(x-2)(x+1)\\ &\boxed{\textbf{(A)}\ 4}\end{align*}
$$

### Solution 2
The x values in which $y=x^6-10x^5+29x^4-4x^3+ax^2$ intersect at y=bx+c are the same as the zeros of $y=x^6-10x^5+29x^4-4x^3+ax^2-bx-c.$
We also know that this graph has 3 places tangent to the x-axis, which means that each root has to have a multiplicity of 2.
Let the function be $(x-p)^2(x-q)^2(x-r)^2$.

Applying Vieta's formulas, we get $2p+2q+2$r = 10  or  p+q+$r = 5$.
Applying it again, we get, after simplification, p^2+q^2+r^2+4pq+4pr+4qr = 29.

Notice that squaring the first equation yields $p^2+q^2+r^2+2pq+2qr+2pr= 25,$ which is similar to the second equation.

Subtracting this from the second equation, we get 2pq+2pr+2qr = 4. Now that we have the pq+pr+qr term, we can manpulate the equations to
yield the sum of squares. $2(p^2+q^2+r^2+2pq+2qr+2pr)-2$pq-2pr-2qr= 25*2-4 or  $2p^2+2q^2+2r^2+2$pq+2qr+2pr = 46. We finally reach $(p+q)^2+(q+r)^2+(p+r)^2 = 46.$

Since the answer choices are integers, we can guess and check squares to get $\{(p+q)^2, (q+r)^2, (p+r)^2\}=\{1, 9, 36\}$ in some order. We can check that this works by adding then and seeing $2p+2q+2$r = 10. We just need to take the lowest value in the set, square root it, and subtract the resulting value from 5 to get $\boxed{\textbf{(A)}\ 4}.$

Note: One could also multiply 2pq+2pr+2qr = 4 by 2 and subtract from $p^2+q^2+r^2+4pq+4pr+4qr = 29 to$ obtain $p^2+q^2+r^2=21$ The ordered triple {16,4,1} sums to 21, and the answer choices are all positive integers, therefore the answer is 4.
#### Alternative method:
After reaching p+q+$r = 5$ and pq + qr + rp = 2, we can algebraically derive pqr.

Applying Vieta's formulas on the $x^3$ term yields $2p^2q+2pq^2+2q^2r+2qr^2+2r^2p+2$rp^2+8pqr = 4.

Notice that (p+q+r)(pq+qr+rp) = $p^2q+pq^2+q^2r+qr^2+r^2p$+rp^2+3pqr, so $2p^2q+2pq^2+2q^2r+2qr^2+2r^2p+2rp^$$2+6pqr =2(p+q+r)$(pq+qr+rp) = 20.

Subtracting this from $2p^2q+2pq^2+2q^2r+2qr^2+2r^2p+2$rp^2+8pqr = 4 yields 2pqr = -16, so pqr = -8, which means that p, q, and r are the roots of the cubic $x^3 -5x^2+2x + 8$, and it is not hard to find that these roots are -1, 2, and 4. The largest of these values is $\boxed{\textbf{(A)}\ 4}.$

Extra note: One can also use the identity
(p+q)(q+r)(p+r)=2pqr+$\sum_{sym}$$p^$$2q$
to compute pqr. From $p^2q+pq^2+q^2r+qr^2+r^2p$+rp^2+4pqr = 2, use our identity to get 2pqr+(p+q)(q+r)(p+r)=2. Then use p+q+$r=5$ to rewrite as 2pqr+(5-p)(5-q)(5-r)=2. Expanding and using pq+qr+pr=2 as well gives the result pqr=-8.

~~ clarkculus
### Solution 3
The x-values where $y = x^6 -10x^5+29x^4 - 4x^3 + ax^2$ intersects
y = bx + c are the zeros of

$$g(x) = x^6 - 10x^5 + 29x^4 - 4x^3 + ax^2 - bx - c.$$

We are told the graph lies above the line except at exactly three values of x.
Thus g(x) $\ge 0$ for all x, and it has exactly three real roots.

Since g(x) has degree 6 and is always nonnegative, each real root must have even multiplicity.
Because there are exactly three real roots and the total multiplicity is 6, each root has multiplicity 2.

So we may write

$$g(x) = (x-p)^2(x-q)^2(x-r)^2.$$

Since the leading coefficient is 1, this equals

$$(x^3 + ux^2 + vx + w)^2.$$

Expanding,

$$(x^3 + ux^2 + vx + w)^2 = x^6 + 2u x^5 + (u^2 + 2v)x^4 + (2uv + 2w)x^3 + \cdots$$

Matching coefficients with
$x^6 -10x^5+29x^4 - 4x^3+\cdots$ gives:

$$2u = -10 \Rightarrow u = -5.$$

$$u^2 + 2v = 29 \Rightarrow 25 + 2v = 29 \Rightarrow v = 2.$$


$$2uv + 2w = -4 \Rightarrow 2(-5)(2) + 2w = -4 \Rightarrow -20 + 2w = -4 \Rightarrow 2w = 16 \Rightarrow w = 8.$$


Thus,

$$g(x) = (x^3 - 5x^2 + 2x + 8)^2.$$

Now factor the cubic. Testing rational roots, we find $x=4$ works:

$$4^3 - 5(4^2) + 2(4) + 8 = 64 - 80 + 8 + 8 = 0.$$

Dividing gives

$$x^3 - 5x^2 + 2x + 8 = (x-4)(x^2 - x - 2).$$

Factor the quadratic:

$$x^2 - x - 2 = (x-2)(x+1).$$

So

$$g(x) = (x-4)^2 (x-2)^2 (x+1)^2.$$

The intersection points are x = -1, 2, 4.

The largest is $\boxed{4}.$

~~bilbaogobao
## Solution 4
First, y=x^6-$10x^5+29x^4-4x^3+ax^2-bx-c = 0$ has exactly 3 roots. Therefore, y = (kx^3+lx^2+mx+n)^2 = 0.

So, $k^2x^6+2$klx^5+(2km+l^2)x^4+$2(kn+lm)x^3+ax^2-bx-c = 0$

By matching the coefficients of the first 4 terms, we have $k^2 = 1, 2kl = -10, 2km+l^2 = 29, 2kn+2lm = -4$

Solving the equations above, we have 2 sets of solutions; first set of which is $k = 1, l = -5, m = 2, n = 8$. Second set of which is k = -1, $l = 5$, m = -2, n = -8. After squaring both sets, they are the same $i.e. x^3-5x^2+2x+8 = 0$.

This is equal to $(x-4)(x-2)(x+1) = 0$. The largest root is $\boxed$ {$\textbf{(A) 4}$}

*~Arcticturn*
## See also
