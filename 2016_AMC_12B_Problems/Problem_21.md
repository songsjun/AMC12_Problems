# 2016 AMC 12B Problem 21

## Problem
Let ABCD be a unit square. Let $Q_1$ be the midpoint of $\overline{CD}.$ For $i=1,2,\dots,$ let $P_i$ be the intersection of $\overline{AQ_i}$ and $\overline{BD},$ and let $Q_{i+1}$ be the foot of the perpendicular from $P_i$ to $\overline{CD}.$ What is
$\sum_{i=1}^{\infty} \text{Area of } \triangle DQ_i P_i$ \, ?

$\textbf{(A)}\ \frac{1}{6} \qquad \textbf{(B)}\ \frac{1}{4} \qquad \textbf{(C)}\ \frac{1}{3} \qquad \textbf{(D)}\ \frac{1}{2} \qquad \textbf{(E)}\ 1$
## Solutions
### Solution 1
[405px](https://artofproblemsolving.com/wiki/index.php/File:201612B-P21.png)

We start with $DQ_i = 1/2$ for $i = 1. \triangle BP_iA \sim \triangle DP_iQ_i$ and $\triangle DP_iQ_{i+1} \sim \triangle DBC$ so we have $\frac{DQ_i}{AB} = \frac{DP_i}{P_iB} = \frac{1}{2} \implies \frac{DP_i}{BD} = \frac{DQ_{i+1}}{DC} = \frac{DQ_{i+1}}{1} = \frac{1}{3} \implies DQ_{i+1} = DQ_{2} = \frac{1}{3}.$ Repeating this same process for subsequent is yields $DQ_3=\frac{1}{4}, DQ_4 = \frac{1}{5}, DQ_5 = \frac{1}{6} \dots$ We can generalize this by saying $DQ_i=\frac{1}{i + 1}.$ Then [$ADQ_i$] = $\frac{1}{2(i + 1)}.$ Let y = [$AP_iD$] and let x = [$DP_iQ_i$]. $\triangle BP_iA$ and $\triangle DP_iQ_i$ are similar with side length ratio (i + 1):1, so [$BP_iA$] $= (i + 1)^2x$. Now, we can express the area of $\triangle ADB (w$hich is 1/2 since it's just half the square) as $y + (i + 1)^2x$, and we can express the area of $ADQ_i$ as x + y. We have a system of equations:

[$ADQ_i$] = x + $y =\frac{1}{2(i + 1)}$
[ADB] $= (i + 1)^2x+y =\frac{1}{2}.$

Solving, we get $x =\frac{1}{2(i+1)(i+2)}.$ So now the problem becomes $\sum_{i=1}^{\infty} \frac{1}{2(i+1)(i+2)}.$ We can rewrite this as

$$\frac{1}{2} \sum_{i=1}^{\infty} \left( \frac{1}{i+1} - \frac{1}{i+2} \right) = \frac{1}{2} \left( \left( \frac{1}{2} - \frac{1}{3} \right) + \left( \frac{1}{3} - \frac{1}{4} \right) + \left( \frac{1}{4} - \frac{1}{5} \right) + \dots \right)$$


All terms cancel except for the $\frac{1}{2}$ on the inside and $\frac{1}{2}$ on the outside, so the answer is $\boxed{\frac{1}{4}}.$

*~grogg007*
### Solution 2
(By Qwertazertl)

We are tasked with finding the sum of the areas of every $\triangle DQ_i^{}P_i^{}$ where i is a positive integer. We can start by finding the area of the first triangle, $\triangle DQ_1^{}P_1^{}.$ This is equal to $\frac{1}{2}$ ⋅ $DQ_1^{}$ ⋅ $P_1^{}Q_2^{}$. Notice that since triangle $\triangle DQ_1^{}P_1^{}$ is similar to triangle $\triangle ABP_1^{}$ in a 1 : 2 ratio, P_$1^{}$Q_$2^{}$ must equal $\frac{1}{3} (s$ince we are dealing with a unit square whose side lengths are 1). DQ_$1^{}$ is of course equal to $\frac{1}{2}$ as it is the mid-point of CD. Thus, the area of the first triangle is [$DQ_1P_$1]=$\frac{1}{2}$ ⋅ $\frac{1}{2}$ ⋅ $\frac{1}{3}.$

The second triangle has a base DQ_$2^{}$ equal to that of P_$1^{}$Q_$2^{}$ (see that $\triangle DQ_2^{}P_1^{}$ ~ $\triangle DCB)$ and using the same similar triangle logic as with the first triangle, we find the area to be [$DQ_2P_$2]=$\frac{1}{2}$ ⋅ $\frac{1}{3}$ ⋅ $\frac{1}{4}.$ If we continue and test the next few triangles, we will find that the sum of all $\triangle DQ_i^{}P_i^{}$ is equal to
$$\frac{1}{2} \sum\limits_{n=2}^\infty \frac{1}{n(n+1)}$$
or
$$\frac{1}{2} \sum\limits_{n=2}^\infty \left(\frac{1}{n} - \frac{1}{n+1}\right)$$

This is known as a telescoping series because we can see that every term after the first $\frac{1}{n}$ is going to cancel out. Thus, the summation is equal to $\frac{1}{2}$ and after multiplying by the half out in front, we find that the answer is $\boxed{\textbf{(B) }\frac{1}{4}}.$
### Solution 3
(By mastermind.hk16)

Note that AD \|\ P_$iQ_{i+1}$\ $\forall$ i $\in \mathbb{N}.$ So $\triangle ADQ_i \sim \triangle P_{i}Q_{i+1}Q_{i}$ \ $\forall$ i $\in \mathbb{N}$

Hence $\frac{Q_iQ_{i+1}}{DQ_{i}}=\frac{P_{i}Q_{i+1}}{AD}$ \ \ $\Longrightarrow DQ_i \cdot P_iQ_{i+1}=Q_iQ_{i+1}$

We compute $\frac{1}{2} \sum_{i=1}^{\infty}DQ_i \cdot P_iQ_{i+1}= \frac{1}{2} \sum_{i=1}^{\infty}Q_iQ_{i+1}=\frac{1}{2} \cdot DQ_1 =\frac{1}{4}$
because $Q_i\rightarrow D$ as i $\rightarrow \infty.$
### Solution 4
(By user0003)

We plot the figure on a coordinate plane with D=(0,0) and A in the positive y-direction from the origin. If $Q_i$=(k, 0) for some k $\neq 0,$ then the line $AQ_i$ can be represented as $y=-\frac{x}{k}+1.$ The intersection of this and BD, which is the line y=x, is

$$P_i = \left(\frac{k}{k+1}, \frac{k}{k+1}\right).$$

As $Q_{i+1}$ is the projection of $P_i$ onto the x-axis, it lies at $\left(\frac{k}{k+1}, 0\right).$ We have thus established that moving from $Q_i$ to $Q_{i+1}$ is equivalent to the transformation x $\rightarrow \frac{x}{x+1}$ on the x-coordinate. The closed form of of the x-coordinate of $Q_i$ can be deduced to be $\frac{1}{1+i},$ which can be determined empirically and proven via induction on the initial case $Q_1=\left(\frac{1}{2}, 0\right).$ Now

$$[\Delta DQ_iP_i] = \frac{1}{2}(DQ_i)(Q_{i+1}P_i) = \frac{1}{2}(DQ_i)(DQ_{i+1}),$$

suggesting that [$\Delta DQ_iP_i$] is equivalent to $\frac{1}{2(i+1)(i+2)}.$ The sum of this from $i=1 to \infty$ is a classic telescoping sequence as in Solution 1 and is equal to $\boxed{\textbf{(B) }\frac{1}{4}}.$
### Solution 5 Diagram and Detailed Steps
[thumb|center|800px| ](https://artofproblemsolving.com/wiki/index.php/Image:2016_AMC_12B_Problem_21.png)

Midpoint $Q_1$ of $\overline{CD}$: $Q_1=\left(\frac{1}{2}, 0\right)$

Equation of $\overline{AQ_1}$:  Slope $m =\frac{0 - 1}{\frac{1}{2} - 0} = -2$  Equation: y = -$2x + 1$

Line $\overline{BD}$:   - Equation: y = x

Intersection $P_1$ of $\overline{AQ_1}$ and $\overline{BD}$:
   - Solve:-$2x + 1 = x \implies 1 = 3x \impliesx =\frac{1}{3}$ Therefore, $P_1=\left(\frac{1}{3}, \frac{1}{3}\right)$

Now, using the pattern for subsequent points $P_k$ and $Q_k$:

General $Q_k$ - For k $\geq 1, Q_k = \left(\frac{1}{k+1}, 0\right)$

Equation of $\overline{AQ_k}$  Slope m = -$(k+1)$  Equation: y = -$(k+1)$x + 1

Intersection $P_k$ of $\overline{AQ_k}$ and $\overline{BD}$:
   - Line $\overline{BD}$: y = x Solve: -($k+1)x + 1 = x \implies 1 = (k+2)$x $\impliesx =\frac{1}{k+2}$
   - Therefore, $P_k=\left(\frac{1}{k+2}, \frac{1}{k+2}\right)$

$Q_{k+1}$ is the foot of the perpendicular from P_k to $\overline{CD},$ so  $Q_{k+1}=\left(\frac{1}{k+2}, 0\right)$

Area of $\triangle DQ_kP_k  = \frac{1}{2} \times DQ_k \times \text{Height}$\ (y\ of\ $P_{k+2})= \frac{1}{2} \times \frac{1}{k+1} \times \frac{1}{k+2} = \frac{1}{2} ( \frac{1}{k+1} - \frac{1}{k+2} )$

This recursive process confirms the telescoping series:


$$\sum_{k=1}^{\infty} \frac{1}{2(k+1)(k+2)} = \frac{1}{2} \left( \left( \frac{1}{2} - \frac{1}{3} \right) + \left( \frac{1}{3} - \frac{1}{4} \right) + \left( \frac{1}{4} - \frac{1}{5} \right) + \cdots \right)$$


Most terms cancel, and we are left with: $\frac{1}{2} \cdot \frac{1}{2} = \boxed{\textbf{(B) }\frac{1}{4}}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Video Solution by CanadaMath (Problem 21-25)
https://www.youtube.com/watch?v=P3jJDLGyF2w&t=1546s

*~THEMATHCANADIAN*
## See Also
