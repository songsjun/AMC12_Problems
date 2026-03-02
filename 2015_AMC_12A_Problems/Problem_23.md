# 2015 AMC 12A Problem 23

> This problem is the same as [2015 AMC 12A #23](https://artofproblemsolving.com/wiki/index.php/2015_AMC_12A_Problems) and [2015 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2015_AMC_10A_Problems).
## Problem
Let S be a square of side length 1. Two points are chosen independently at random on the sides of S. The probability that the straight-line distance between the points is at least $\frac12$ is $\frac{a-b\pi}{c},$ where a,b, and c are positive integers and $\text{gcd}(a,b,c) = 1.$ What is a+b+c?

$\textbf{(A)}\ 59 \qquad\textbf{(B)}\ 60 \qquad\textbf{(C)}\ 61 \qquad\textbf{(D)}\ 62 \qquad\textbf{(E)}\ 63$
## Solution 1
Divide the boundary of the square into halves, thereby forming 8 segments. Without loss of generality, let the first point A be in the bottom-left segment. Then, it is easy to see that any point in the 5 segments not bordering the bottom-left segment will be distance at least $\dfrac{1}{2}$ apart from A. Now, consider choosing the second point on the bottom-right segment. The probability for it to be distance at least 0.5 apart from A is $\dfrac{0 + 1}{2} = \dfrac{1}{2}$ because of linearity of the given probability. (Alternatively, one can set up a coordinate system and use geometric probability.)

If the second point B is on the left-bottom segment, then if A is distance x away from the left-bottom vertex, then B must be at least $\dfrac{1}{2} - \sqrt{0.25 - x^2}$ away from that same vertex. Thus, using an averaging argument we find that the probability in this case is

$$\frac{1}{\frac{1}{2}^2} \int_0^{\frac{1}{2}} \dfrac{1}{2} - \sqrt{0.25 - x^2} dx = 4\left(\frac{1}{4} - \frac{\pi}{16}\right) = 1 - \frac{\pi}{4}.$$


(Alternatively, one can equate the problem to finding all valid (x, y) with 0 < x, y < $\dfrac{1}{2}$  such that $x^2 + $y^2 $\ge \dfrac{1}{4},$ i.e. (x, y) is outside the unit circle with radius 0.5.)

Thus, averaging the probabilities gives

$$P = \frac{1}{8} \left(5 + \frac{1}{2} + 1 - \frac{\pi}{4}\right) = \frac{1}{32} (26 - \pi).$$


Our answer is $\textbf{(A)}.$
## Solution 2 (Casework)
Fix one of the points on a SIDE. There are three cases: the other point is on the same side, an adjacent side, or the opposite side, with probability 0.25, 0.5, 0.25, respectively.

Opposite side: Probability is obviously 1, no matter what.

Same side: Pretend the points are on a line with coordinates x and y. If |a-b| $\le \frac{1}{2},$ drawing a graph will give probability $\frac{1}{4}.$

Adjacent side: superimpose a coordinate system over the points; call them (x, 0) and (0, y). WLOG set x, y >= 0 and x, y <= 1. We need $x^2+y^2>0$.25, and drawing the coordinate system with bounds (0, 0), (1, 0), (0, 1), (1, 1) gives probability $1-\frac{\pi}{16}$ that the distance between the points is >0.5.

Adding these up and finding the fraction gives us $\frac{1}{32} (26 - \pi)$ for an answer of  $\textbf{(A)}$\ 59 .
## Solution 3 (Average Function Value/Quick Faux Integration)
WLOG, let the first point be on the bottom side of the square. The points where the second point could exist are outside a circle of radius 0.5 centered on the first point. The parts of the square that lie in this circle are the distance from the point to the closest side of the square n, the distance from the point to the outside of the circle (the radius 0.5), and any portion of the nearest side that lies within the circle as represented by the Pythagorean Theorem $\sqrt{\frac{1}{4}-n^2}.$ Thus, the total length the second point can exist in can be represented by $f(n)=4-(0.5+n+\sqrt{\frac{1}{4}-n^2}).$ Distributing, $f(n)=3.5-n-\sqrt{\frac{1}{4}-n^2}.$

Then, we can find the average of this function through calculus (wow more calc?). This formula is as follows,
$$\frac{1}{a_{f} -a_{i}} \int_{a_{i}}^{a_{f}} f(x)\;dx$$

For this case, the limits of integration are 0 and 0.5 ($0\leqn\leq 0.5).$ Then, we have,


$$
2\int_{0}^{\frac{1}{2}} 3.5-n-\sqrt{\frac{1}{4}-n^2}\;dn
2(\int_{0}^{\frac{1}{2}} 3.5\;dn -\int_{0}^{\frac{1}{2}}n\;dn -\int_{0}^{\frac{1}{2}}\sqrt{\frac{1}{4}-n^2}\;dn)
$$


Even if you don't know how to integrate, as long as you know the idea of integration, you can figure these out. Graphing the first two, you can see that the first is a rectangle of length 0.5 and width 3.5. The second is an isosceles right triangle of leg length 0.5.


$$\int_{0}^{\frac{1}{2}} 3.5\;dn=\frac{7}{4}, \int_{0}^{\frac{1}{2}}n\;dn=\frac{1}{8}$$


Recognize that the third integral is a semicircle of radius 0.5 and centered at the origin. This is where $\pi$ comes in. From 0 to 0.5, the integral is simply a quarter circle. $\frac{\frac{1}{2}^2\pi}{4}=\frac{\pi}{16}.$
$$\int_{0}^{\frac{1}{2}}\sqrt{\frac{1}{4}-n^2}\;dn)=\frac{\pi}{16}$$

If you want me to actually integrate these, look below. Do note that this is for those that have a limited knowledge of integration or those that have little time but are being very clever.

Overall, where second point could lie to satisfy the problem is a length of $2($\frac{7}{4}-\frac{\pi}{16}-\frac{1}{8})$=\frac{26-\pi}{8}.$ By contrast, the total length where it could lie is the perimeter of the square 4. So the possible points that the second point could be make up $\frac{\frac{26-\pi}{8}}{4}=\frac{26-\pi}{32}$ of the square's perimeter. Obviously, $\gcd(32, 26, 1)=1. 32+26+1=59\implies\boxed{A}$

*Sorry for the long explanation!*
 **Actual Integration as Promised**

$$2(\int_{0}^{\frac{1}{2}} 3.5\;dn -\int_{0}^{\frac{1}{2}}n\;dn -\int_{0}^{\frac{1}{2}}\sqrt{\frac{1}{4}-n^2}\;dn)$$


First two integrals easily done by power rule

$$
\int_{0}^{\frac{1}{2}} 3.5\;dn=3.5\int_{0}^{\frac{1}{2}} 1\;dn=3.5n\Big|_0^{\frac{1}{2}}=7/4
\int_{0}^{\frac{1}{2}}n\;dn= \frac{n^2}{2}\Big|_0^{\frac{1}{2}}=1/8
$$


Last integral by trig substitution (long)


$$\int_{0}^{\frac{1}{2}}\sqrt{\frac{1}{4}-n^2}\;dn=\frac{1}{2}\int_{0}^{\frac{1}{2}}\sqrt{1-(2n)^2}$$


If $\sin(u)=2$n, then $dn=\frac{\cos(u)}{2}$\;du (differentiate both sides).

Then, $\frac{1}{4}\int_{n=0}^{n=\frac{1}{4}}\cos(u)\sqrt{1-\sin(u)^2}$\;$du=\frac{1}{4}\int_{n=0}^{n=\frac{1}{2}}\cos(u)\sqrt{\cos^2(u)}$\;$du=\frac{1}{2}\int_{n=0}^{n=\frac{1}{2}}\cos^2(u)$\;du

This is a known integral that can be derived from further trig identities (specifically double angle). For the sake of brevity,


$$\frac{1}{4}\int_{n=0}^{n=\frac{1}{2}}\cos^2(u)\;du= \frac{1}{4}(\frac{2u + \sin(2u)}{4})\Big|_{x=0}^{x=\frac{1}{2}}=\frac{2u+\sin(2u)}{16}\Big|_{x=0}^{x=\frac{1}{2}}.$$


Convert the limits: $\sin(u)=2\cdot0\impliesu_1=0$ and $\sin(u)=2\cdot\frac{1}{2} \implies$ u_$2=\frac{\pi}{2}$

Finally, we have $\frac{2u+\sin(2u)}{16}$\Big|$_{0}^{\frac{\pi}{2}$}=$\frac{\pi+\sin(\pi)}{16}-0=\frac{\pi}{16}$

*~Solution By BJHHar*
## Solution 4 (Extension, CALCULUS)
Set the problem up similarly to in solution 1, where we split the square into 8 segments. Notice that each segment is the same, so WLOG use any one of them. For the purposes of this solution, I will assume the segment we use starts at (0, 0) and ends at (0.5, 0). The square I use will have vertices of (0,0), (1,0), (0,1), and (1,1).

A way we can figure out when the distance is at least 0.5 is if we figure out when it isn't 0.5. Let's pick a point on our segment and denote it with (x, 0). Then, there are three ways a second point can be within the boundaries of this first point. Either, it is to the left of it (if possible), to the right of it, or it is on the segment that forms a right angle with it.

Obviously, there is x distance if the point is to the left of the point x. Since we denoted this segment to be from 0 to 0.5, then there will always be 0.5 distance to the right of the point x (as that's the maximum that we are trying to figure out).

The difficult part is finding the total length on the segment that is perpendicular to our segment. However, since the square has a right angle, we can first find that the segment should have a length of $\sqrt{0.25-x^2} (b$y the Pythagorean theorem, with hypotenuse 0.5 and one leg being x).

Now that we have our three distances, all we need to do is find the average value of them. We can best do this with "Integral/Interval", and so we take the integral from 0 to 0.5 of $x+0.5+\sqrt{0.25-x^2}$ and then divide it by 0.5 (the interval). To integrate $\sqrt{0.25-x^2}$ by hand, we want to pull out the 1/4, and then apply u-sub and our integration rules to find the answer.

We get 0.75 - $\frac{\pi}{16} \cdot 2.$ Simplify this into $\frac{6-\pi}{8}.$

Now we are on our last stage. Proceed to make this equivalent to what the question is asking, as we have found the probability that the second point is within a distance of 0.5, whereas the question asks for at least a distance of 0.5 (so more than). We can do this simply by doing 4- $\frac{6-\pi}{8} (a$s 4 is the total amount of length). This equates to $\frac{26-\pi}{8}$ and then we divide by 4 as that is the total amount of length (remember this is probability).

Thus, we get $\frac{26-\pi}{32}$ for our probability, and so the answer is 26 + 1 + 32 = $\textbf{(A)}$\ 59.

Some notes: I tried to explain everything but it's quite difficult to explain - there is a way of non-calculus (like there always is) that I think was mentioned above, something with circles (since the thing under the square root is just $x^2+y^2 =\frac{1}{4},$ so finding the average value of that isn't difficult).

IronicNinja~ Edited by AngelaLZ~
## Solution 5 (Area)
Choose a certain side for one of the points to be on. Let the distance from the point to the vertex on its left be x

We split this into two cases:

Case 1: $0\leqx\leq \frac12$:

The total length of the segments for which the other point can be on such that the straight-line distance between the points is less than $\frac12$ is $\sqrt{\frac14-x^2}+x+\frac12.$ We can graph this in the Cartesian plane and find the area of the region below the curve and above the line $y=0$.

Case 2: $\frac12<x\leq 1$:

This is basically Case 1 but flipped over the line $x=\frac12.$

So our total probability is 1 minus the area of the graph over the total area (4, perimeter of square). Notice that the desired area of the region below the curve we found earlier is the sum of a quarter circle with radius $\frac12$ and centered at (0,0) and a trapezoid with height $\frac12$ and bases of length $\frac12$ and $\frac32.$ Adding this all up then multiplying by 2, we have $\frac{\pi}{8}+\frac34$ and then the probability of the desired result would be $1-\frac{\pi+6}{32}=\frac{26-\pi}{32}$ and our answer is $26+1+32=\boxed{59}.$ ~caroline2023
### Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2015amc12a/399

*~dolphin7*
## See Also
