# 2020 AMC 12A Problem 25

## Problem
The number $a=\frac{p}{q},$ where p and q are relatively prime positive integers, has the property that the sum of all real numbers x satisfying
$$\lfloor x \rfloor \cdot \{x\} = a \cdot x^2$$
is 420, where $\lfloor$ x $\rfloor$ denotes the greatest integer less than or equal to x and $\{x\}=x- \lfloor$ x $\rfloor$ denotes the fractional part of x. What is p+q?

$\textbf{(A) } 245 \qquad \textbf{(B) } 593 \qquad \textbf{(C) } 929 \qquad \textbf{(D) } 1331 \qquad \textbf{(E) } 1332$
## Solution 1 (Solves for Floor(x))
Let $w=\lfloor$ x $\rfloor$ and $f=\{x\}$ denote the whole part and the fractional part of x, respectively, for which $0\leq$ f<1 and x=w+f.

We rewrite the given equation as $w\cdotf=a\cdot(w+f)^2. \hspace{38.75mm}(1)$
Since $a\cdot(w+f)^2\geq0,$ it follows that $w\cdotf\geq0,$ from which $w\geq0.$

We expand and rearrange (1) as $af^2+(2a-1)wf+aw^2=0,\hspace{23mm}(2)$ which is a quadratic with either f or w.

For simplicity purposes, we will treat w as some fixed nonnegative integer so that (2) is a quadratic with f. By the Quadratic Formula, we have $f=w\Biggl(\frac{1-2a\pm\sqrt{1-4a}}{2a}\Biggr). \hspace{25mm}(3)$
If $w=0$, then $f=0$. We get x=w+$f=0$, which does not affect the sum of the solutions. Therefore, we consider the case for $w\geq1$:

Recall that $0\leq$ f<1, so $\frac{1-2a\pm\sqrt{1-4a}}{2a}\geq0.$ From the discriminant, we require that $0\leq1-4$a<1, or 0 We consider each part of $0\leq$ f<1 separately:
$$1.   f\geq0$$

From (2), note that a>0, $(2a-1)$w<0, and $aw^2>0$. By Descartes' Rule of Signs, we deduce that (2) must have two positive roots, so $f\geq0$ is always valid.

Alternatively, from (3) and (4), note that all values of a for which 0 satisfy 1-$2a>\sqrt{1-4a}.$ We deduce that both roots in (3) must be positive, so $f\geq0$ is always valid.
2.   f<1

We rewrite (3) as $f=w\Biggl(\frac{1}{2a}-1\pm\frac{\sqrt{1-4a}}{2a}\Biggr).$ From (4), it follows that $\frac{1}{2a}\geq\frac{1}{1/2}=2.$ The larger root is $f\geqw\left(2-1+2\sqrt{1-4a}\right) \geq 1\Biggl(2-1+2\sqrt{1-4\cdot\frac14}\Biggr) = 1,$ which contradicts f<1. So, we take the smaller root, from which $f=w\Biggl(\frac{1}{2a}-1-\frac{\sqrt{1-4a}}{2a}\Biggr)$ for some constant $k=\frac{1}{2a}-1-\frac{\sqrt{1-4a}}{2a}>0.$ We rewrite f as f=wk, in which f<1 is valid as long as k<$\frac 1$w. Note that the solutions of x are generated at $w=1,2,3,\ldots,W,$ up to some value w=W such that $\frac{1}{W+1}\leq$ k<$\frac1W.$

 Now, we express x in terms of w and k: x=w+f=w+wk=w(1+k). The sum of all solutions to the original equation is $\sum_{w=1}^{W}$w(1+k)=(1+k)$\cdot\sum_{w=1}^{W}$w=(1+k)$\cdot\frac{W(W+1)}{2}=420. \hspace{10mm}($\bigstar) As 1+k<$1+\frac1W,$ we conclude that 1+k is slightly above 1 so that $\frac{W(W+1)}{2}$ is slightly below 420, or W(W+1) is slightly below 840. By observations, we get W=28. Substituting this into (\bigstar) produces $k=\frac{1}{29},$ which satisfies $\frac{1}{W+1}\leq$ k<$\frac1W,$ as required. Finally, we solve for a in $k=\frac{1}{2a}-1-\frac{\sqrt{1-4a}}{2a}$:$\begin{align*} \frac{1}{29}$&=$\frac{1}{2a}-1-\frac{\sqrt{1-4a}}{2a}$ \\ $\frac{2}{29}$a&=1-$2a-\sqrt{1-4a}$ \\ $\frac{60}{29}$a-1&=-$\sqrt{1-4a}$ \\ $\frac{60^2}{29^2}a^2-\frac{120}{29}$a+1&=1-4a \\ $\frac{60^2}{29^2}a^2-\frac{4}{29}$a&=0 \\ $a\left(\frac{60^2}{29^2}a-\frac{4}{29}\right)$&=0. $\end{align*}$ Since a>0, we obtain $\frac{60^2}{29^2}a-\frac{4}{29}=0,$ from which $a=\frac{4}{29}\cdot\frac{29^2}{60^2}=\frac{29}{900}.$ The answer is $29+900=\boxed{\textbf{(C) } 929}.$ ~MRENTHUSIASM (inspired by Math Jams's **2020 AMC 10/12A Discussion**)
## Solution 2 (Solves for x)
Let $x_n$ be a root in the interval (n,$n+1$). In this interval, $\lfloorx_n\$rfloor = n and $\{x_n\}=x_n$-n, so we must have $ax_n^2 = nx_n-n^2, i.e., ax_n^2-nx_n+n^2=0.$ We can homogenize this equation by setting $x_n=n\zeta$; then x_$1=\zeta,$ and $\zeta$ is a root of $a\zeta^2-\zeta+1=0.$ Suppose N is the largest integer for which there is such a root; we have, for $n=1,2,\ldots$ , N, n < $x_n=n\zeta <n+1$ Summing over $n\in\{1,2,\ldots , N\}$ we get $\tfrac 12 N(N+1) < 420 = \tfrac 12 N(N+1)\zeta < \tfrac 12 N(N+3)$ From the right inequality we get 27< N and from the left one we get N<29. Thus N=28. Using this in the middle equality we get $\zeta = \tfrac{30}{29}.$ Since $\zeta$ satisfies $a\zeta^2-\zeta+1=0,$ we get $a =\zeta^{-2}(\zeta-1)= \tfrac{29^2}{30^2}\cdot \tfrac 1{29}= \tfrac{29}{900}.$ The answer is $29+900=\boxed{\textbf{(C) } 929}.$ ~Shihan
## Solution 3 (Solves for x)
First note that $\lfloorx\rfloor \cdot\{x\}<0$ when x<0 while $ax^2\ge 0\forallx\in \mathbb{R}.$ Thus we only need to look at positive solutions ($x=0$ doesn't affect the sum of the solutions). Next, we break $\lfloorx\rfloor\cdot\{x\}$ down for each interval [n,$n+1$), where n is a positive integer. Assume $\lfloorx\rfloor=n,$ then $\{x\}$=x-n. This means that when $x\in$ [n,$n+1), \lfloorx\rfloor \cdot\{x\}$=n(x-n)=nx-n^2. Setting this equal $to ax^2$ gives $nx-n^2=ax^2\impliesax^2-nx+n^2=$0 $\impliesx=\frac{n\pm \sqrt{n^2-4an^2}}{2a}$ We're looking at the solution with the positive x, which is $x=\frac{n-n\sqrt{1-4a}}{2a}=\frac{n}{2a}\left(1-\sqrt{1-4a}\right).$ Note that if $\lfloorx\rfloor=n$ is the greatest n such that $\lfloorx\rfloor \cdot\{x\}=ax^2$ has a solution, the sum of all these solutions is slightly over $\sum_{k=1}^{n}k=\frac{n(n+1)}{2},$ which is 406 when $n=28$, just under 420. Checking this gives $\begin{align*} \sum_{k=1}^{28}\frac{k}{2a}\left(1-\sqrt{1-4a}\right)$&=$\frac{1-\sqrt{1-4a}}{2a}\cdot 406=$420 \\ $\frac{1-\sqrt{1-4a}}{2a}$&=$\frac{420}{406}=\frac{30}{29}$ \\ $29-29\sqrt{1-4a}$&=60a \\ $29\sqrt{1-4a}$&=29-60a \\ $29^2-4\cdot 29^2a&=29^2+3600a^2-120\cdot $29a \\ 3600a^2&=116a \\ a&=$\frac{116}{3600}=\frac{29}{900} \implies \boxed{\textbf{(C) } 929}. \end{align*}$ ~ktong * Note: Using the Binomial expansion one can see that $\frac{1-\sqrt{1-4a}}{2a}$ is close to 1 when a is close to 0. ~tsun26
## Remark
Let f(x)=$\lfloor$ x $\rfloor \cdot\{x\}$ and $g(x)=a\cdotx^2.$ We make the following table of values: $\begin{array}{c|c|c|l}$ & & & \\ [-2ex] $\boldsymbol{x}$ & $\boldsymbol{\lfloor x \rfloor}$ & $\boldsymbol{f(x)}$ & $\multicolumn{1}{c}{\textbf{Equation}}$ \\ [1.5ex] $\hline$ & & & \\ [-1ex] [0,1) & 0 & 0 & $y=$0 \\ [1.5ex] [1,2) & 1 & [0,1) & $y=x-$1 \\ [1.5ex] [2,3) & 2 & [0,2) & y=2x-4 \\ [1.5ex] [3,4) & 3 & [0,3) & y=3x-9 \\ [1.5ex] [4,5) & 4 & [0,4) & y=4x-16 \\ [1.5ex] $\cdots$ & $\cdots$ & $\cdots$ & $\cdots$ \\ [1.5ex] [m,$m+$1) & m & [0,m) & $y=mx-$m^2 \\ [1.5ex] $\end{array}$ We graph f(x) (in red, by branches) and g(x) (in blue, for $a=\frac{29}{900})$ as shown below. [center](https://artofproblemsolving.com/wiki/index.php/File:2020_AMC_12A_Problem_25.png) Graph in Desmos: https://www.desmos.com/calculator/ouvaiqjdzj ~MRENTHUSIASM
## Video Solution 1 (Geometry)
This video shows how things like The Pythagorean Theorem and The Law of Sines work together to solve this seemingly algebraic problem: https://www.youtube.com/watch?v=6IJ7Jxa98zw&feature=youtu.be
## Video Solution 2
https://www.youtube.com/watch?v=xex8TBSzKNE ~MathEx
## Video Solution 3 (by Art of Problem Solving)
https://www.youtube.com/watch?v=7_mdreGBPvg&t=428s&ab_channel=ArtofProblemSolving Created by Richard Rusczyk
## Video Solution 4
https://youtu.be/i5b5P9RPuas ~MathProblemSolvingSkills
## See Also
