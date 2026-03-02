# 2011 AMC 12B Problem 22

## Problem
Let $T_1$ be a triangle with side lengths 2011, 2012, and 2013. For n $\geq 1,$ if $T_n=\triangle ABC$ and D, E, and F are the points of tangency of the incircle of $\triangle ABC$ to the sides AB, BC, and AC, respectively, then $T_{n+1}$ is a triangle with side lengths AD, BE, and CF, if it exists. What is the perimeter of the last triangle in the sequence $\left(T_n\right)$?

$\textbf{(A)}\ \frac{1509}{8} \qquad \textbf{(B)}\ \frac{1509}{32} \qquad \textbf{(C)}\ \frac{1509}{64} \qquad \textbf{(D)}\ \frac{1509}{128} \qquad \textbf{(E)}\ \frac{1509}{256}$
## Solution
Answer: (D)

Let AB = c, BC = a, and AC = b

Then AD = AF, BE = BD and CF = CE

Then a = BE + CF, b = AD + CF, c = AD + BE

Hence:


$$
AD = AF = \frac{b + c - a}{2}
BE = BD = \frac{a + c - b}{2}
CF = CE = \frac{a + b - c}{2}
$$


Note that a + 1 = b and a - 1 = c for $n = 1$, I claim that it is true for all n, assume for induction that it is true for some n, then


$$
AD = AF = \frac{a}{2}
BE = BD = \frac{a - 2}{2} = AD - 1
CF = CE = \frac{a + 2}{2} = AD + 1
$$


Furthermore, the average for the sides is decreased by a factor of 2 each time.

So $T_n$ is a triangle with side length $\frac{2012}{2^{n- 1}} - 1, \frac{2012}{2^{n-1}}, \frac{2012}{2^{n-1}} + 1$

and the perimeter of such $T_n$ is $\frac{(3)(2012)}{2^{n-1}}$

Now we need to find when $T_n$ fails the triangle inequality. So we need to find the last n such that $\frac{2012}{2^{n-1}} > 2$

$$\frac{2012}{2^{n-1}} > 2$$
 $2012 > 2^n$
$$n \le 10$$

For $n = 10$, perimeter is $\frac{(3)(2012)}{2^{9}} = \frac{1509}{2^7} = \frac{1509}{128}$
## Solution 2
This problem is a PoP(Power of Point) Bash exercise. What I did to solve this problem was look at recursive perimeters. The first ever perimeter is $P_1 = 2011 + 2012 + 2013$. Next, by PoP, inscribing the circle gives us three new lengths, namely AD, BE, CF. Denote AD as $x_1$ and homogeneously the others. Then, $x_1+x_2 = 2011, x_2+x_3 = 2012$, and $x_1+x_3 = 2013$. If we add all these equations up and divide by 2, we get $x_1+x_2 + x_3=\frac{2011 + 2012 + 2013}{2}.$ Writing this with $P_1 = 2011 + 2012 + 2013$, we get that our new perimeter, $P_2$, is indeed equal to $\frac{P_1}{2}.$ Similarly, by the same concept, we get that $P_3=\frac{P_1}{4}$ and the pattern keeps going. In general, I found that for each new perimeter $P_n$, $P_n=\frac{P_1}{2^{n-1}}.$ Now, substituting in the numerical value of $P_1$, we get that $P_n=\frac{2011 + 2012 + 2013}{2^{n-1}}.$ If you keep dividing the numerator and denominator by 2, I got that: $P_n=\frac{1509}{2^{n-3}}.$ This representation of a new perimeter in terms of n looks very similar to the option choices, so we're on the right path. Now, all we need to do is find out the last value of n when the sequence stops working. By the Triangular Inequality, we may be able to finish this off. Now, I won't go into depths here, but listing out terms and using the Triangular Inequality gives us:
First Sequence:
$x_1 < 2012$

$x_2 < 2013$

$x_3 < 2011$.
The ordered triple for this set of $(x_1, x_2, x_3)$ is (1005, 1006, 1007) if you solve the PoP system of equations we got earlier. If you keep listing out terms, we can come up with the general form, and that is:
$$x_1 < \frac{503}{2^{n-4}}$$

$$x_2 < \frac{503}{2^{n-4}} + 1$$

$$x_3 < \frac{503}{2^{n-4}} - 1.$$
The ordered triple for this set of $(x_1, x_2, x_3)$ is ($\frac{503}{2^{n-4}}, \frac{503}{2^{n-4}} - 1, \frac{503}{2^{n-4}} + 1).$ Now, if we plug in these values of $x_1, x_2$, and $x_3$ into the inequalities, we see that the first two are always satisfied, but the last one is only satisfied when:
$2^{n-2} < 503$(You will get this if you simplify the last inequality). The last n for this to be satisfied is when n = 10. If we go up to our general representation of P_n, we see that P_n = $\frac{1509}{2^{n-3}}.$ Plugging in 10 because this is the last n(and also the last triangle), we our final answer of $\frac{1509}{2^{7}} = \boxed{\frac{1509}{128}}$ or $\boxed{D}.$

*~ilikemath247365*
## See also
Identical problem to the [2011 AMC 10B Problems/Problem 25](https://artofproblemsolving.com/wiki/index.php/2011_AMC_10B_Problems/Problem_25).
