# 2022 AMC 12B Problem 21

> This problem is the same as [2022 AMC 10B #22](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_22) and [2022 AMC 12B #21](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_21).
## Problem
Let $S$ be the set of circles in the coordinate plane that are tangent to each of the three circles with equations $x^{2}+y^{2}=4, x^{2}+y^{2}=64$, and $(x-5)^{2}+y^{2}=3$. What is the sum of the areas of all circles in $S$?

$\textbf{(A)}~48\pi\qquad\textbf{(B)}~68\pi\qquad\textbf{(C)}~96\pi\qquad\textbf{(D)}~102\pi\qquad\textbf{(E)}~136\pi\qquad$
## Solution 1
<asy>
        import geometry;

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.5cm);
```


		void dc(pair x, pen p) {

> [Asymptote diagram - not rendered in Markdown]

```asy
pair y = intersectionpoints(circle((0,0),8),(0,0)--1000*x)[0];
draw(circle(x, abs(x-y)),p+linewidth(2));
```

        }


> [Asymptote diagram - not rendered in Markdown]

```asy
pair O1 = (0,0),O2=(5,0),P1=intersectionpoints(circle(O1,5),circle(O2,3+sqrt(3)))[0],P2=intersectionpoints(circle(O1,3),circle(O2,5+sqrt(3)))[0],P3=intersectionpoints(circle(O1,5),circle(O2,3-sqrt(3)))[0],P4=intersectionpoints(circle(O1,3),circle(O2,5-sqrt(3)))[0];
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle(O1,2));
draw(circle(O1,8));
draw(circle(O2,sqrt(3)));
```


		dc(P1,blue);
		dc(P2,red);
		dc(P3,mediumgreen);
		dc(P4,brown);
</asy>
The circles match up as follows: Case $1$ is brown, Case $2$ is blue, Case $3$ is green, and Case 4 is red.
Let $x^2 + y^2 = 64$ be circle $O$, $x^2 + y^2 = 4$ be circle $P$, and $(x-5)^2 + y^2 = 3$ be circle $Q$.
All the circles in S are internally tangent to circle $O$.
There are four cases with two circles belonging to each:

$*P$ and $Q$ are internally tangent to $S$.

$*P$ and $Q$ are externally tangent to $S$.

$*P$ is externally and Circle $Q$ is internally tangent to $S$.

$*P$ is internally and Circle $Q$ is externally tangent to $S$.

Consider Cases $1$ and $4$ together. Since circles $O$ and $P$ have the same center, the line connecting the center of $S$ and the center of $O$ will pass through the tangency point of both $S$ and $O$ and the tangency point of $S$ and $P$. This line will be the diameter of $S$ and have length $r_P + r_O = 10$. Therefore the radius of $S$ in these cases is $5$.

Consider Cases $2$ and $3$ together. Similarly to Cases $1$ and $4$, the line connecting the center of $S$ to the center of $O$ will pass through the tangency points. This time, however, the diameter of $S$ will have length $r_P-r_O=6$. Therefore, the radius of $S$ in these cases is $3$.

The set of circles $S$ consists of $8$ circles - $4$ of which have radius $5$ and $4$ of which have radius $3$.
The total area of all circles in $S$ is $4(\pi + 3^2\pi) = 136\pi \Rightarrow \boxed{\textbf{(E)}}$.

*~naman12*
## Solution 2
We denote by $C_1$ the circle that has the equation $x^2 + y^2 = 4$.
We denote by $C_2$ the circle that has the equation $x^2 + y^2 = 64$.
We denote by $C_3$ the circle that has the equation $(x-5)^2 + y^2 = 3$.

We denote by $C_0$ a circle that is tangent to $C_1, C_2$ and $C_3$.
We denote by $\left( u, v \right)$ the coordinates of circle $C_0$, and $r$ the radius of this circle.

From the graphs of circles $C_1, C_2, C_3$, we observe that if $C_0$ is tangent to all of them, then $C_0$ must be internally tangent to $C_2$.
We have


$$u^2 + v^2 = \left( 8 - r \right)^2 . \hspace{1cm} (1)$$


We do the following casework analysis in terms of the whether $C_0$ is externally tangent to $C_1$ and $C_3$.

Case 1: $C_0$ is externally tangent to $C_1$ and $C_3$.

We have


$$u^2 + v^2 = \left( r + 2 \right)^2   \hspace{1cm} (2)$$


and


$$(u-5)^2 + v^2 = \left( r + \sqrt{3} \right)^2 . \hspace{1cm} (3)$$


Taking $(2) - (1)$, we get $r + 2 = 8 - r$. Thus, $r = 3$.
We can further compute (omitted here) that there exist feasible $(u,v)$ with this given $r$.

Case 2: $C_1$ is internally tangent to $C_0$ and $C_3$ is externally tangent to $C_0$.

We have


$$u^2 + v^2 = \left( r - 2 \right)^2  \hspace{1cm} (2)$$


and


$$(u-5)^2 + v^2 = \left( r + \sqrt{3} \right)^2 . \hspace{1cm} (3)$$


Taking $(2) - (1)$, we get $r - 2 = 8 - r$. Thus, $r = 5$.
We can further compute (omitted here) that there exist feasible $(u,v)$ with this given $r$.

Case 3: $C_1$ is externally tangent to $C_0$ and $C_3$ is internally tangent to $C_0$.

We have


$$u^2 + v^2 = \left( r + 2 \right)^2  \hspace{1cm} (2)$$


and


$$(u-5)^2 + v^2 = \left( r - \sqrt{3} \right)^2 . \hspace{1cm} (3)$$


Taking $(2) - (1)$, we get $r + 2 = 8 - r$. Thus, $r = 3$.
We can further compute (omitted here) that there exist feasible $(u,v)$ with this given $r$.

Case 4: $C_1$ is internally tangent to $C_0$ and $C_3$ is internally tangent to $C_0$.

We have


$$u^2 + v^2 = \left( r - 2 \right)^2  \hspace{1cm} (2)$$


and


$$(u-5)^2 + v^2 = \left( r - \sqrt{3} \right)^2 . \hspace{1cm} (3)$$


Taking $(2) - (1)$, we get $r - 2 = 8 - r$. Thus, $r = 5$.
We can further compute (omitted here) that there exist feasible $(u,v)$ with this given $r$.


Because the graph is symmetric with the $x$-axis, and for each case above, the solution of $v$ is not 0. Hence, in each case, there are two congruent circles whose centers are symmetric through the $x$-axis.

Therefore, the sum of the areas of all the circles in $S$ is $\left( 3^2 \pi +5^2 \pi +3^2 \pi +5^2 \pi \right) = \boxed{\textbf{(E) } 136 \pi}$.

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
*~MrThinker (LaTeX Error)*
## Solution 3
The problem of counting the number of circles tangent to a given number of other circles, lines, or points is called Apollonius's Problem. Here, there are three circles; solutions to Apollonius's problem tell us that there are 8 possible tagent circles. When looking for all eight, we can notice that the diagram is symmetrical about the x-axis, so we only need to find four different circles and then reflect them to the other side.

After drawing in those circles, we can use any of the above methods to find the radii of the circle. The important step is to realize that the segment between tangent circles' centers must pass through the point of tangency. From here, we can prove that the center of the circle with equation $x^2 + y^2 = 4$ and the center of the circle tangent to all three must both lie on the radius of $x^2 + y^2 = 64$, allowing us to quickly find the radius of the tangent circle.

For the tangent circles mostly above the x-axis, there are two of radius 5, and two of radius 3. The total area is $50 \pi + 18 \pi = 68 \pi$. As due to symmetry there are four other circles below the x-axis, the total area is $136 \pi$, so we choose $\boxed{ (E) }$.

*~LeonQS*
## Video Solution by OmegaLearn using Circular Tangency
https://youtu.be/ZDpmvGmNefQ

*~pi_is_3.14*
## Video Solution
https://youtu.be/1pkuBlRKt6Q

*~ThePuzzlr*

https://youtu.be/nqE5QYkzRAw

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by TheBeautyofMath
With additional justification reasoning for certain statements made. Also an additional twist on a potential similar alternate problem at the end.
https://youtu.be/r-jNrjKIXTU

*~IceMatrix*
## Video Solution by The Power of Logic(#20-#21)
https://youtu.be/7FiTsDNMmgg
## Video Solution by Interstigation
https://youtu.be/GWEfdjTiXSQ

*~Interstigation*
## See Also
