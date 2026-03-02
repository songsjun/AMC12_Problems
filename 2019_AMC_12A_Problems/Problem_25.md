# 2019 AMC 12A Problem 25

## Problem
Let $\triangle A_0B_0C_0$ be a triangle whose angle measures are exactly $59.999^\circ, 60^\circ,$ and $60.001^\circ.$ For each positive integer n, define $A_n$ to be the foot of the altitude from $A_{n-1}$ to line $B_{n-1}C_{n-1}$. Likewise, define $B_n$ to be the foot of the altitude from $B_{n-1}$ to line $A_{n-1}C_{n-1}$, and $C_n$ to be the foot of the altitude from $C_{n-1}$ to line $A_{n-1}B_{n-1}$. What is the least positive integer n for which $\triangle A_nB_nC_n$ is obtuse?

$\textbf{(A) } 10 \qquad \textbf{(B) }11 \qquad \textbf{(C) } 13\qquad \textbf{(D) } 14 \qquad \textbf{(E) } 15$
## Solution 1
For all nonnegative integers n, let $\angle C_nA_nB_n=x_n, \angle A_nB_nC_n=y_n,$ and $\angle B_nC_nA_n=z_n.$

Note that quadrilateral $A_0B_0A_1B_1$ is cyclic since $\angle A_0A_1B_0=\angle A_0B_1B_0=90^\circ$; thus, $\angle A_0A_1B_1=\angle A_0B_0B_1=90^\circ-x_0.$ By a similar argument, $\angle A_0A_1C_1=\angle A_0C_0C_1=90^\circ-x_0.$ Thus, x_$1=\angle A_0A_1B_1+\angle A_0A_1C_1=180^\circ-2$x_0. By a similar argument, y_$1=180^\circ-2$y_0 and z_$1=180^\circ-2$z_0.

Therefore, for any positive integer n, we have $x_n=180^\circ-2x_{n-1}$ (identical recurrence relations can be derived for $y_n$ and $z_n$). To find an explicit form for this recurrence, we guess that the constant term is related exponentially to n (and the coefficient of $x_0$ is (-2)^n). Hence, we let $x_n=pq^n+r+(-2)^nx_0.$ We will solve for p, q, and r by iterating the recurrence to obtain x_$1=180^\circ-$2x_0, $x_2=$4x_$0-180^\circ,$ and $x_3=540-8x_0$. Letting $n=1$,2,3 respectively, we have $\begin{align}$ pq+r&=180 \\ $pq^2+r$&=-180 \\ $pq^3+r$&=540 $\end{align}$

Subtracting (1) from (3), we have $pq(q^2-1)=360,$ and subtracting (1) from (2) gives pq$(q-1)$=-360. Dividing these two equations gives $q+1$=-1, so q=-2. Substituting back, we get p=-60 and $r=60$.

We will now prove that for all positive integers n, $x_n=-60(-2)^n+60+(-2)^nx_0=(-2)^n(x_0-60)$$$+60 via induction. Clearly the base case of $n=1$ holds, so it is left to prove that $x_{n+1}=(-2)^{n+1}($x_0-$60)+60$ assuming our inductive hypothesis holds for n. Using the recurrence relation, we have $\begin{align*}x_{n+1}$&=180-$2x_n$ \\ &=180-$2((-2)^n(x_0-$60)+60) \\ &$=(-2)^{n+1}(x_0-$60)+60 $\end{align*}$

Our induction is complete, so for all positive integers n, $x_n=(-2)^n(x_0-60$)+60. Identical equalities hold for $y_n$ and $z_n$.

The problem asks for the smallest n such that either $x_n$, $y_n$, or $z_n$ is greater than $90^\circ. WLOG,$ let x_$0=60^\circ,$ y_$0=59.999^\circ,$ and z_$0=60.001^\circ.$ Thus, $x_n=60^\circ$ for all n, $y_n=-(-2)^n(0.001)+60,$ and $z_n$=(-2)^n(0.001)+60. Solving for the smallest possible value of n in each sequence, we find that $n=15$ gives $y_n>90^\circ.$ Therefore, the answer is $\boxed{\textbf{(E) } 15}.$
## Solution 2
We start from Solution 1 until we reach the recurrence relation $x_n = 180-2x_{n - 1}$. Iterate this again, to get $x_{n - 1} = 180 - 2x_{n - 2}$. Subtract the two, getting $x_{n}$ = -$x_{n - 1}+2x_{n - 2}$. This recurrence has characteristic equation $x^2 + x - 2 = 0 = (x + 2)(x - 1) = 0 \iff$ x = -2, 1. Now, write $x_n$ = p + q $\cdot (-2)^n.$ We obtain similar recursions for y, z that can be easily solved by getting $x_1, y_1, z_1$ from the original recursive formula and then using those two values to solve for p and q. Then proceed with the last paragraph of Solution 1.
## Solution 3 (If you're short on time)
We note that the problem seems quite complicated, but since it is an AMC 12, the difference between the largest angle of $\triangle A_nB_nC_n$ and $60^{\circ}$ (we call this quantity S) most likely reduces to a simpler problem like some repeating sequence. The only obvious sequence (for the answer choices) is a geometric sequence with an integer common ratio. From here, we get that $S_n=0.001S^n$ and we need $S_n>30$. The first power of two greater than 30,000 is $2^{15}$ thus our answer is $\boxed{\textbf{(E) } 15}.$
## Solution 4 (Orthic Triangle)
By angle chasing (abuse those right triangles and cyclic quadrilaterals), we find that the angles of $\triangle A_nB_nC_n,$ in degrees, would be 60, 60 + $0.001(2^n)$, and 60 - $0.001(2^n)$.

We just need to find the value such that 60 + $0.001(2^n) > 90$.

Thus, we have $0.001(2^n) > 30$, giving $n\geq15.$

Our answer is $\boxed{\textbf{(E) } 15}.$

Note: $\triangle A_nB_nC_n$ is the orthic triangle of $\triangle A_{n-1}B_{n-1}C_{n-1},$ which is made by connecting the foots of altitudes into a triangle as specified in the problem.

*~xHypotenuse*
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2019amc12a/497

*~dolphin7*
## See Also
