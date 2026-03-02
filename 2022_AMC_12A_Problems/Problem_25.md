# 2022 AMC 12A Problem 25

## Problem
A circle with integer radius r is centered at (r, r). Distinct line segments of length $c_i$ connect points (0, $a_i) to (b_i$, 0) for 1 $\le$ i $\le 14$ and are tangent to the circle, where $a_i$, $b_i$, and $c_i$ are all positive integers and $c_1\lec_2\le \cdots \lec_{14}$. What is the ratio $\frac{c_{14}}{c_1}$ for the least possible value of r?

$\textbf{(A)} ~\frac{21}{5} \qquad\textbf{(B)} ~\frac{85}{13} \qquad\textbf{(C)} ~7 \qquad\textbf{(D)} ~\frac{39}{5} \qquad\textbf{(E)} ~17$
## Solution 1
Suppose that with a pair ($a_i$,$b_i$) the circle is an excircle. Then notice that the hypotenuse must be (r-x)+(r-y), so it must be the case that $a_i^2+b_i^2=(2r-a_i-b_i$)^2. Similarly, if with a pair ($a_i$,$b_i$) the circle is an incircle, the hypotenuse must be (x-r)+(y-r), leading to the same equation.

Notice that this equation can be simplified through SFFT to $(a_i-2r)(b_i-2r)=2r^2$. Thus, we want the smallest r such that this equation has at least 14 distinct pairs ($a_i$,$b_i$) for which this holds. The obvious choice to check is $r=6$. In this case, since $2r^2=2^3\cdot 3^2$ has 12 positive factors, we get 12 pairs, and we get another two if the factors are -8,-9 or vice versa. One can check that for smaller values of r, we do not even get close to 14 possible pairs.

When $r=6$, the smallest possible c-value is clearly when the factors are negative. When this occurs, $a_i=4, b_i=3$ (or vice versa), so the mimimal c is 5. The largest possible c-value occurs when the largest of $a_i$ and $b_i$ are maximized. This occurs when the factors are 72 and 1, leading to $a_i=84, b_i=13$ (or vice-versa), leading to a maximal c of 85.

Hence the answer is $\frac{85}5=\boxed{17}.$

*~bluelinfish*
## Solution 2
Case 1: The tangent and the origin are on the opposite sides of the circle.

In this case, a, b > $2r$.

We can easily prove that
$$a + b - 2 r = c . \hspace{1cm} (1)$$

Recall that c = $\sqrt{a^2 + b^2}.$

Taking square of (1) and reorganizing all terms, (1) is converted as
$$\left( a - 2 r \right) \left( b - 2 r \right) = 2 r^2 .$$

Case 2: The tangent and the origin are on the same sides of the circle.

In this case, 0 < a, b < r.

We can easily prove that
$$2 r - a - b = c . \hspace{1cm} (2)$$

Recall that c = $\sqrt{a^2 + b^2}.$

Taking square of (2) and reorganizing all terms, (2) is converted as
$$\left( a - 2 r \right) \left( b - 2 r \right) = 2 r^2 .$$

Putting both cases together, for given r, we look for solutions of a and b satisfying
$$\left( a - 2 r \right) \left( b - 2 r \right) = 2 r^2 ,$$
with either a, b > $2r$ or 0 < a, b < r.

Now, we need to find the smallest r, such that the number of feasible solutions of (a, b) is at least 14.

For equation
$$uv = 2 r^2 ,$$
we observe that the R.H.S. is a not a perfect square. Thus, the number of positive (u, v) is equal to the number of positive divisors of $2 r^2.$

Second, for each feasible positive solution (u, v), its opposite (-u, -v) is also a solution. However, (u,v) corresponds to a feasible solution if (a, b) with a = u + $2r$ and b = v + $2r$, but (-u, -v) may not lead to a feasible solution if (a, b) with $a = 2$ r - u and $b = 2$ r - v.

Recall that we are looking for r that leads to at least 14 solutions.
Therefore, the above observations imply that we must have r, such that $2 r^2$ has least 7 positive divisors.

Following this guidance, we find the smallest r is 6. This leads to the following solutions:


$$\left( a_1, b_1, c_1 \right) = \left( 3, 4, 5 \right), \left( a_2, b_2, c_2 \right) = \left( 4, 3, 5 \right).$$


$$\left( a_3, b_3, c_3 \right) = \left( 20, 21, 29 \right), \left( a_4, b_4, c_4 \right) = \left( 21, 20, 29 \right).$$


$$\left( a_5, b_5, c_5 \right) = \left( 18, 24, 30 \right), \left( a_6, b_6, c_6 \right) = \left( 24, 18, 30 \right).$$


$$\left( a_7, b_7, c_7 \right) = \left( 16, 30, 34 \right), \left( a_8, b_8, c_8 \right) = \left( 30, 16, 34 \right).$$


$$\left( a_9, b_9, c_9 \right) = \left( 15, 36, 39 \right), \left( a_{10}, b_{10}, c_{10} \right) = \left( 36, 15, 39 \right).$$


$$\left( a_{11}, b_{11}, c_{11} \right) = \left( 14, 48, 50 \right), \left( a_{12}, b_{12}, c_{12} \right) = \left( 48, 14, 50 \right).$$


$$\left( a_{13}, b_{13}, c_{13} \right) = \left( 13, 84, 85 \right), \left( a_{14}, b_{14}, c_{14} \right) = \left( 84, 13, 85 \right).$$


Therefore, $\frac{c_{14}}{c_1} = \boxed{\textbf{(E) 17}}.$
## Solution 3
As $c_i$ is the length of the segment (0,$a_i$) and ($b_i$,0)， $a_i^2+b_i^2=c_i^2$. The equation for the line that passes through (0,$a_i$) and ($b_i$,0) is $a_ix+b_iy-a_ib_i=0$.

By the point-line distance formula from point (r,r) to line $a_ix+b_iy-a_ib_i=0$


$$r = \frac{ |a_ir+b_ir-a_ib_i| }{ \sqrt{a_i^2+b_i^2} }, \quad c_i = \frac{ |a_ir+b_ir-a_ib_i| }{r} = |a_i+b_i- \frac{a_ib_i}{r}|$$


$$\because c_i \quad \text{is an integer}, \quad \therefore r|a_ib_i$$

To find $c_1$ and $c_{14}$ for the smallest r, we will list Pythagorean triples ($a_i$,$b_i$,$c_i$) with relatively prime elements from the smallest. Notice that we only need to find 7 triples with $a_i$, the 7 other triples will simply be ($b_i$,$a_i$,$c_i). a_i$ will not equal $b_i$ because then $c_i=a_i\cdot \sqrt{2},$ meaning that $a_i$, $b_i$, and $c_i$ cannot all be integers. The 7 smallest triples are: (3,4,5), (5,12,13), (7,24,25), (8,15,17), (11,60,61), (12,35,37), (13,84,85) Therefore, $\frac{c_{14}}{c_1} = \frac{85}{5} = \boxed{\textbf{(E) 17}}.$ ~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solution by Math-X (Let's understand the question first)
https://youtu.be/7yAh4MtJ8a8?si=2dTtBDEZLIjN3YWS&t=9728 ~Math-X ~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)
## Video Solution by MOP 2024
https://youtu.be/5jO__fUbgs8 ~r00tsOfUnity
## Video Solution by Steven Chen
https://youtu.be/6RfGCTNQ2Jw
## Video Solution (5 Minutes)
https://youtu.be/79CLeiJrPvs ~MathProblemSolvingSkills.com
## See also
