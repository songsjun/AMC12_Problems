# 2026 AMC 12A Problem 3

> This problem is the same as [2026 AMC 10A #4](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_4) and [2026 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_3).

## Problem
Half of the internal angles of a polygon measure $150^{\circ}$ each, and the other half of its internal angles measure $190^{\circ}$ each. How many sides does the polygon have?

$\textbf{(A)}\   36  \qquad 	\textbf{(B)}\   40  \qquad 	\textbf{(C)}\   60  \qquad 	\textbf{(D)}\   72  \qquad 	\textbf{(E)}\   180$

## Solution 1
Let the polygon have n sides. The sum of the interior angles of this polygon is $(n-2)\cdot 180$. $\frac{n}{2}$ of the angles are $150$ and $\frac{n}{2}$ of the angles are $190$, so


$$
\frac{n}{2} \cdot 150 + \frac{n}{2} \cdot 190= (n-2)\cdot 180
$$




$$
75n + 95n = 180n - 360
$$




$$
10n = 360
$$




$$
n = 36
$$


Therefore, our answer is $\boxed{\textbf{(A)}\hspace{1mm}36}$
$\newline$
$\sim$cyrus825

Slight $\LaTeX$ corrections by ~singularity1

## Solution 2
Because we know that half of the angles are $190^c$ and the other half is $150^c$, the average angle is $\frac{190^c+150^c}{2} = 170^c$ on average for each angle. If the average is $170^c$, then 

$$
\frac{180*(n-2)}{n} = 170
$$




$$
170n=180*(n-2) \to 0 = 10n-360
$$




$$
10n=360 \to n = \boxed{36}
$$



~Horseneck3

## Solution 3
$\frac{lcm(340,360)}{360}=34 \Rightarrow 34+2= \boxed{\textbf{(A)}\hspace{1mm}36}$

The calculation is trivial using prime factors

~SecretUser17

## Solution 4
We can find the average exterior angle by doing $180^\circ-150^\circ=30^\circ$ for the first angle and $180^\circ-190^\circ=-10^\circ$ for the second. Since there are an equal amount of both exterior angles, we can find the average exterior angle:


$$
\frac{30^\circ+\left(-10^\circ\right)}{2} = 10^\circ
$$


Since the sum of the exterior angles of any polygon is $360^\circ$


$$
\frac{360^\circ}{10^\circ}=\boxed{\textbf{(A)}\hspace{1mm}36}
$$



~MC_HELLO

## Video Solution 1
https://youtu.be/sNFSsL75LGE?t=428

~MathisFun

## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
