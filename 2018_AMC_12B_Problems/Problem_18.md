# 2018 AMC 12B Problem 18

> This problem is the same as [2018 AMC 12B #18](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12B_Problems) and [2018 AMC 10B #20](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10B_Problems).
## Problem
A function $f$ is defined recursively by $f(1)=f(2)=1$ and

$$f(n)=f(n-1)-f(n-2)+n$$

for all integers $n \geq 3$. What is $f(2018)$?

$\textbf{(A) } 2016 \qquad \textbf{(B) } 2017 \qquad \textbf{(C) } 2018 \qquad \textbf{(D) } 2019 \qquad \textbf{(E) } 2020$
## Solution 1 (Algebra)
For all integers $n \geq 7,$ note that


$$\begin{align*}
f(n)&=f$(n-1)-f(n-2)$+n \\
&=[f$(n-2)-f(n-3)+n-$1]-f(n-2)$$+n \\
&=-f($n-3)+2n-1$ \\
&=-[f$(n-4)-f(n-5)+n-$3]+$2n-1$ \\
&=-f$(n-4)+f(n-5)+n+2$ \\
&=-[f$(n-5)-f(n-6)+n-$4]+f($n-5)+n+2$ \\
&=f$(n-6)+6$.
$\end{align*}$$$


It follows that


$$\begin{align*}
f(2018)&=f(2012)+6 \\
&=f(2006)+12 \\
&=f(2000)+18 \\

$$
& \ \vdots \\
&=f(2018-6\cdot336)+6\cdot336 \\
$$

&=f(2)+2016 \\
$$&=\boxed{\textbf{(B) } 2017}.$$
$\end{align*}$$$


*~MRENTHUSIASM*
## Solution 2 (Algebra)
For all integers $n\geq3,$ we rearrange the given equation:

$$f(n)-f(n-1)+f(n-2)=n. \hspace{28.25mm}(1)$$


For all integers $n\geq4,$ it follows that

$$f(n-1)-f(n-2)+f(n-3)=n-1. \hspace{15mm}(2)$$


For all integers $n\geq4,$ we add $(1)$ and $(2):$

$$f(n)+f(n-3)=2n-1. \hspace{38.625mm}(3)$$


For all integers $n\geq7,$ it follows that

$$f(n-3)+f(n-6)=2n-7. \hspace{32mm}(4)$$


For all integers $n\geq7,$ we subtract $(4)$ from $(3):$

$$f(n)-f(n-6)=6. \hspace{47.5mm}(5)$$


From $(5),$ we have the following system of $\frac{2018-8}{6}+1=336$ equations:


$$\begin{align*}
f(2018)-f(2012)&=6, \\
f(2012)-f(2006)&=6, \\
f(2006)-f(2000)&=6, \\
$$& \ \vdots \\$$
f(8)-f(2)&=6.
$\end{align*}$$$


We add these equations up to get

$$f(2018)-f(2)=6\cdot336=2016,$$

 from which $f(2018)=f(2)+2016=\boxed{\textbf{(B) } 2017}.$

*~AopsUser101 ~MRENTHUSIASM*
## Solution 3 (Finite Differences)
Preamble: In this solution, we define the sequence $A$ to satisfy $a_n = f(n),$ where $a_n$ represents the $n$th term of the sequence $A.$ This solution will show a few different perspectives. Even though it may not be as quick as some of the solutions above, I feel like it is an interesting concept, and may be more motivated.

To begin, we consider the sequence $B$ formed when we take the difference of consecutive terms between $A.$ Define $b_n = a_{n+1} - a_n.$ Notice that for $n \ge 4,$ we have <center>$\begin{cases}\begin{aligned} a_{n+1} &= a_{n} - a_{n-1} + (n+1) \\ a_{n} &= a_{n-1} - a_{n-2} + n \end{aligned}.\end{cases}$</center> Notice that subtracting the second equation from the first, we see that $b_{n} = b_{n-1} - b_{n-2} + 1.$

If you didn’t notice that $B$ repeated directly in the solution above, you could also, possibly more naturally, take the finite differences of the sequence $b_n$ so that you could define $c_n = b_{n+1} - b_n.$ Using a similar method as above through reindexing and then subtracting, you could find that $c_n = c_{n-1} - c_{n-2}.$ The sum of any six consecutive terms of a sequence which satisfies such a recursion is $0,$ in which you have that $b_{n} = b_{n+6}.$ In the case in which finite differences didn’t reduce to such a special recursion, you could still find the first few terms of $C$ to see if there are any patterns, now that you have a much simpler sequence. Doing so in this case, it can also be seen by seeing that the sequence $C$ looks like

$$\underbrace{2, 1, -1, -2, -1, 1,}_{\text{cycle period}} 2, 1, -1, -2, -1, 1, \ldots$$

 in which the same result follows.

Using the fact that $B$ repeats every six terms, this motivates us to look at the sequence $B$ more carefully. Doing so, we see that $B$ looks like

$$\underbrace{2, 3, 2, 0, -1, 0,}_{\text{cycle period}} 2, 3, 2, 0, -1, 0, \ldots$$

 (If you tried pattern finding on sequence $B$ directly, you could also arrive at this result, although I figured defining a second sequence based on finite differences was more motivated.)

Now, there are two ways to finish.

Finish Method #1: Notice that any six consecutive terms of $B$ sum to $6,$ after which we see that $a_n = a_{n-6} + 6.$ Therefore, $a_{2018} = a_{2012} + 6 = \cdots = a_{2} + 2016 = \boxed{\textbf{(B) } 2017}.$

Finish Method #2: Notice that $a_{2018} = a_{2017} - a_{2016} + 2018 = B_{2016} + 2018 = -1 + 2018 = \boxed{\textbf{(B) } 2017}.$

*~Professor-Mom*
## Solution 4 (Pattern)
Start out by listing some terms of the sequence.


$$\begin{align*}
f(1)&=1 \\
f(2)&=1 \\
f(3)&=3 \\
f(4)&=6 \\
f(5)&=8 \\
f(6)&=8 \\
f(7)&=7 \\
f(8)&=7 \\
f(9)&=9 \\
f(10)&=12 \\
f(11)&=14 \\
f(12)&=14 \\
f(13)&=13 \\
f(14)&=13 \\
f(15)&=15 \\
$$& \ \vdots$$
$\end{align*}$$$


Notice that $f(n)=n$ whenever $n$ is an odd multiple of $3$, and the pattern of numbers that follow will always be $+$3, +2, +0, -1, +0, +2$$.
The largest odd multiple of $3$ smaller than $2018$ is $2013$, so we have


$$\begin{align*}
f(2013)&=2013 \\
f(2014)&=2016 \\
f(2015)&=2018 \\
f(2016)&=2018 \\
f(2017)&=2017 \\
$$f(2018)&=\boxed{\textbf{(B) } 2017}.$$
$\end{align*}$$$
## Solution 5 (Pattern)
Writing out the first few values, we get


$$1,1,3,6,8,8,7,7,9,12,14,14,13,13,15,18,20,20,19,19,\ldots.$$

 We see that every number $x$ where $x \equiv 1\pmod 6$ has $f(x)=x,f(x+1)=f(x)=x,$ and $f(x-1)=f(x-2)=x+1.$ The greatest number that's $\pmod{6}$ and less than $2018$ is $2017,$ so we have $f(2017)=f(2018)=\boxed{\textbf{(B) } 2017}.$
## Solution 6 (Complex Numbers)
$$\begin{align*}
f(n)&=f$(n-1)-f(n-2)$+n \\
f$(n-1)$&=f(n-2)$-f(n-3)+n-1$
$\end{align*}$$$


Subtracting those two and rearranging gives


$$\begin{align*}
f(n)-$2f(n-1)+2f(n-$2)-f(n-3)$$&=1 \\
f($n-1)-2f($n-2)+$2f(n-3)-f(n-4)$&=1
$\end{align*}$$$


Subtracting those two gives $f(n)-3f(n-1)+4f(n-2)-3f(n-3)+f(n-4)=0.$

The characteristic polynomial is $x^4-3x^3+4x^2-3x+1=0.$

$x=1$ is a root, so using synthetic division results in $(x-1)(x^3-2x^2+2x-1)=0.$

$x=1$ is a root, so using synthetic division results in $(x-1)^2(x^2-x+1)=0.$

$x^2-x+1=0$ has roots $x=\frac{1}{2}\pm\frac{i\sqrt{3}}{2}.$

And

$$f(n)=(An+D)\cdot1^n+B\cdot\left(\frac{1}{2}-\frac{i\sqrt{3}}{2}\right)^n+C\cdot\left(\frac{1}{2}+\frac{i\sqrt{3}}{2}\right)^n.$$


Plugging in $n=1, n=2, n=3$, and $n=4$ results in a system of $4$ linear equations$\newline$
Solving them gives $A=1, \ B=\frac{1}{2}-\frac{i\sqrt{3}}{2}, \ C=\frac{1}{2}+\frac{i\sqrt{3}}{2}, \ D=1.$ Note that you can guess $A=1$ by answer choices.

So plugging in $n=2018$ results in


$$\begin{align*}

$$
2018+1+\left(\frac{1}{2}-\frac{i\sqrt{3}}{2}\right)^{2019}+\left(\frac{1}{2}+\frac{i\sqrt{3}}{2}\right)^{2019}&=2019+(\cos(-60^{\circ})+i\sin(-60^{\circ}))^{2019})+(\cos(60^{\circ})+i\sin(60^{\circ}))^{2019}) \\
&=2019+(\cos(-60^{\circ}\cdot2019)+i\sin(-60^{\circ}\cdot2019))+(\cos(60^{\circ}\cdot2019)+i\sin(60^{\circ}\cdot2019)) \\
&=\boxed{\textbf{(B) } 2017}.
$$

$\end{align*}$$$


*~ryanbear*
## Solution 7
We utilize patterns to solve this equation:


$$\begin{align*}
f(3)&=3, \\
f(4)&=6, \\
f(5)&=8, \\
f(6)&=8, \\
f(7)&=7, \\
f(8)&=8.
$\end{align*}$$$


We realize that the pattern repeats itself. For every six terms, there will be four terms that we repeat, and two terms that we don't repeat. We will exclude the first two for now, because they don't follow this pattern.

First, we need to know whether or not $2016$ is part of the skip or repeat. We notice that $f(6),f(12), \ldots,f(6n)$ all satisfy $6+6(n-1)=n,$ and we know that $2016$ satisfies this, leaving $n=336.$ Therefore, we know that $2016$ is part of the repeat section. But what number does it repeat?

We know that the repeat period is $2,$ and it follows that pattern of $1,1,8,8,7,7.$ Again, since $f(6) = f(5)$ and so on  for the repeat section, $f(2016)=f(2015),$ so we don't need to worry about which one, since it repeats with period $2.$ We see that the repeat pattern of $f(6),f(12),\ldots,f(6n)$ follows $8,14,20,$ it is an arithmetic sequence with common difference $6.$ Therefore, $2016$ is the $335$th term of this, but including $1,$ it is $\cdot6+1=\boxed{\textbf{(B) } 2017}.$

*~CharmaineMa07292010*
## Solution 8
We list out the first $13$ terms and their differences:

[500px|center| ](https://artofproblemsolving.com/wiki/index.php/File:2018_10b_S8.png)

We see the differences are clearly repeating every $6$ terms here; we see that $\equiv2\pmod6$. We see that the values for $2$ and $8$ are both one less, so we conclude our answer is $\boxed{\textbf{(B)}~2017}.$

*~Technodoggo*
## Video Solution
https://www.youtube.com/watch?v=L0BnK6QhNFA

*~Coach J*

https://www.youtube.com/watch?v=aubDsjVFFTc

*~bunny1*

https://youtu.be/ub6CdxulWfc

*~savannahsolver*
## See Also
