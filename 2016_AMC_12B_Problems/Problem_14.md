# 2016 AMC 12B Problem 14

## Problem
The sum of an infinite geometric series is a positive number S, and the second term in the series is 1. What is the smallest possible value of S?

$\textbf{(A)}\ \frac{1+\sqrt{5}}{2} \qquad \textbf{(B)}\ 2 \qquad \textbf{(C)}\ \sqrt{5} \qquad \textbf{(D)}\ 3 \qquad \textbf{(E)}\ 4$
## Solution
The second term in a geometric series is $a_2 = a \cdot$ r, where r is the common ratio for the series and a is the first term of the series. So we know that $a\cdotr = 1$ and we wish to find the minimum value of the infinite sum of  the series. We know that: S_$\infty = \frac{a}{1-r}$ and substituting in $a=\frac{1}{r},$ we get that S_$\infty = \frac{\frac{1}{r}}{1-r} = \frac{1}{r(1-r)} = \frac{1}{r}+\frac{1}{1-r}.$ From here, you can either use calculus or AM-GM.

$\textbf{Calculus}$

Let f(x) = $\frac{1}{x-x^2} = (x-x^2)^{-1},$ then f'(x) = -(x-$x^2)^{-2}\cdot (1-2x).$ Since f(0) and f(1) are undefined x $\neq 0,1.$ This means that we only need to find where the derivative equals 0, meaning 1-$2x = $0 $\Rightarrowx =\frac{1}{2}.$ So  $r =\frac{1}{2},$ meaning that S_$\infty = \frac{1}{\frac{1}{2} - (\frac{1}{2})^2} = \frac{1}{\frac{1}{2}-\frac{1}{4}} = \frac{1}{\frac{1}{4}} = 4$

$\textbf{AM-GM}$

For 2 positive real numbers a and b, $\frac{a+b}{2} \geq \sqrt{ab}.$ Let a = $\frac{1}{r}$ and b = $\frac{1}{1-r}.$ Then: $\frac{\frac{1}{r}+\frac{1}{1-r}}{2} \geq \sqrt{\frac{1}{r}\cdot\frac{1}{1-r}}=\sqrt{\frac{1}{r}+\frac{1}{1-r}}.$ This implies that $\frac{S_\infty}{2} \geq \sqrt{S_\infty}.$ or S_$\infty^2 \geq 4 \cdot S_\infty.$ Rearranging : (S_$\infty-2)^2 \geq 4 \Rightarrow S_\infty - 2 \geq 2 \Rightarrow S_\infty \geq 4.$ Thus, the smallest value is S_$\infty = 4.$
## Solution 1
The sum of the geometric sequence is $\frac{a}{1 - r}$ where a is the first term and r is the common ratio. We know the second term, ar, is equal to 1. Thus ar = 1 $\Rightarrowa =\frac{1}{r}.$ This means,
$$S = \frac{a}{1 - r} = \frac{1/r}{1 - r} = \frac{1}{r(1 - r)}.$$
In order to minimize S, we maximize the denominator. By AM-GM,
$$\frac{(r) + (1 - r)}{2} \ge \sqrt{r(1-r)} \Rightarrow \frac{1}{4} \ge r(1-r).$$
Equality occurs at $r = 1-r \Rightarrowr =\frac{1}{2}.$ This gives the minimum value of S as $\frac{\frac{1}{1/2}}{1 - \frac{1}{2}} = \boxed{(E)~4}.$
## Solution 2
A geometric sequence always looks like

$$a,ar,ar^2,ar^3,\dots$$

and they say that the second term ar=1. You should know that the sum of an infinite geometric series (denoted by S here) is $\frac{a}{1-r}.$ We now have a system of equations which allows us to find S in one variable.


$$
\begin{align*} ar&=1 \\ S&=\frac{a}{1-r} \end{align*}
$$


$\textbf{Solving in terms of \textit{a} then graphing}$

$$S=\frac{a^2}{a-1}$$

We seek the smallest positive value of S. We proceed by graphing in the aS plane (if you want to be rigorous, only stop graphing when you know all the rest you didn't graph is just the approaching of asymptotes and infinities) and find the answer is $\boxed{\textbf{(E)}\ 4}.$

$\textbf{Solving in terms of \textit{r} then graphing}$

$$S=\frac{1}{-r^2+r}$$

We seek the smallest positive value of S. We proceed by graphing in the rS plane (if you want to be rigorous, only stop graphing when you know all the rest you didn't graph is just the approaching of asymptotes and infinities) and find the answer is $\boxed{\textbf{(E)}\ 4}.$

$\textbf{Solving in terms of \textit{a} then doing some calculus}$

$$S=\frac{a^2}{a-1}$$

We seek the smallest positive value of S. $\frac{(a-2)a}{(a-1)^2}=S$' and $\frac{(a-2)a}{(a-1)^2}=0$ at $a=0$ and $a=2. \frac{2}{(a-1)^3}=S$'' and $\frac{2}{(0-1)^3}$ is negative (implying a relative maximum occurs at $a=0$) and $\frac{2}{(2-1)^3}$ is positive (implying a relative minimum occurs at $a=2).  At a=2$, S=4. Since this a competition math problem with an answer, we know this relative minimum must also be the absolute minimum among the "positive parts" of S and that our answer is indeed $\boxed{\textbf{(E)}\ 4}.$ However, to be sure of this outside of this cop-out, one can analyze the end behavior of S, how S behaves at its asymptotes, and the locations of its maxima and minima relative to the asymptotes to be sure that 4 is the absolute minimum among the "positive parts" of S.

$\textbf{Solving in terms of \textit{r} then being clever}$

$$S=\frac{1}{-r^2+r}$$

We seek the smallest positive value of S. We could use calculus like we did in the solution immediately above this one, but that's a lot of work and we don't have a ton of time. To minimize the positive value of this fraction, we must maximize the denominator. The denominator is a quadratic that opens down, so its maximum occurs at its vertex. The vertex of this quadratic occurs at $x=\frac{1}{2}$ and $\frac{1}{-(\frac{1}{2})^2+\frac{1}{2}}=\boxed{\textbf{(E)}\ 4}.$
## Solution 3
$\textbf{Completing the Square and Quadratics}$
Let r be the common ratio. If the second term is 1, the first must be $\frac{1}{r}.$ By the infinite geometric series formula, the sum must be S=$\frac{\frac{1}{r}}{1-r}$ This equals $\frac{1}{r(1-r)}.$ To find the minimum value of S, we must find the maximum value of the denominator, r(1-r), which is $\frac{1}{4},$ completing the square. Thus, the minimum value of S is $\boxed{\textbf{(E)}\ 4}.$
## Solution 4 (no AM-GM or Calculus)
Our sequence is $a_1$,1,.... Since we know this is a converging series, our ratio is in (0,1). Because the 2nd term in the sequence is a 1, the ratio must be $\frac{1}{a_1},$ so we can write S as $\frac{a_1}{1-\frac{1}{a_1}}.$ With some manipulation we get S=$\frac{1}{a_1-1}.$ Since S has to be a "positive number," we come to think $a_1$ is 2 (makes S positive & we know a sequence/series of a ratio 1/2 is definitely convergent). So our sequence is 2,1,1/2,1,4,..., $2+1+1=\boxed{\textbf{(E)}\ 4}.$
*~thedodecagon*
## Solution 5 (Quadratic formula)
As in the previous solutions, S=$\frac{1}{r-r^2} \impliesSr^2-Sr+1=$0 $\implies \text{discriminant}=S^2-4S \ge 0$ since we know that such an r exists. We then have S $\ge 4$ for positive S, and this is achievable when r=.5, so the answer is 4.
## Video Solution by CanadaMath (Problem 11-20)
Fast Forward to 12:26 for problem 14
https://www.youtube.com/watch?v=4osvFatUv1o

*~THEMATHCANADIAN*
## See Also
