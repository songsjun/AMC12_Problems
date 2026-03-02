# 2008 AMC 12B Problem 21

## Problem
Two circles of radius 1 are to be constructed as follows. The center of circle A is chosen uniformly and at random from the line segment joining (0,0) and (2,0). The center of circle B is chosen uniformly and at random, and independently of the first choice, from the line segment joining (0,1) to (2,1). What is the probability that circles A and B intersect?

$\textbf{(A)} \; \frac {2 + \sqrt {2}}{4} \qquad \textbf{(B)} \; \frac {3\sqrt {3} + 2}{8} \qquad \textbf{(C)} \; \frac {2 \sqrt {2} - 1}{2} \qquad \textbf{(D)} \; \frac {2 + \sqrt {3}}{4} \qquad \textbf{(E)} \; \frac {4 \sqrt {3} - 3}{4}$
## Solution 1
Circles centered at A and B will overlap if A and B are closer to each other than if the circles were tangent. The circles are tangent when the distance between their centers is equal to the sum of their radii. Thus, the distance from A to B will be 2. Since A and B are separated by 1 vertically, they must be separated by $\sqrt{3}$ horizontally. Thus, if |$A_x-B_x$|<$\sqrt{3},$ the circles intersect.

Now, plot the two random variables $A_x$ and $B_x$ on the coordinate plane. Each variable ranges from 0 to 2. The circles intersect if the variables are within $\sqrt{3}$ of each other. Thus, the area in which the circles don't intersect is equal to the total area of two small triangles on opposite corners, each of area $\frac{(2-\sqrt{3})^2}{2}.$ So, the total area of the 2 triangles sums to ($2-\sqrt{3})^2.$ Since the total 2 $\times 2$ square has an area of 4, the probability of the circles not intersecting is $\frac{(2-\sqrt{3})^2}{4}.$ But remember, we want the probability that they do intersect. We conclude the probability the circles intersect is:$1-\frac{(2-\sqrt{3})^2}{4}=\boxed{\textbf{(E)}\frac{4\sqrt{3}-3}{4}}.$
## Solution 2
Two circles intersect if the distance between their centers is less than the sum of their radii. In this problem, A and B intersect if

$$\sqrt{(A_X-B_X)^2+(A_Y-B_Y)^2}\leq2 \Rightarrow (A_X-B_X)^2+1\leq4 \Rightarrow (A_X-B_X)\leq \sqrt{3}.$$


In other words, the two chosen x-coordinates must differ by no more than $\sqrt{3}.$ To find this probability, we divide the problem into cases:

1) $A_X$ is on the interval (0,$2-\sqrt{3}).$ The probability that $B_X$ falls within the desired range for a given $A_X$ is $A_X$ (on the left) +$\sqrt{3} (o$n the right) all over 2 (the range of possible values). The total probability for this range is the sum of all these probabilities of $B_X$ (over the range of $A_X$) divided by the total range of $A_X$ (which is 2). Thus, the total probability for this interval is $\frac{1}{2}\left(\int_{0}^{2-\sqrt{3}} \frac{x+\sqrt{3}}{2}$\,dx$\right) =\frac{1}{2}\left(x^2/4+\frac{x\sqrt{3}}{2}$\Big |$_{0}^{2-\sqrt{3}$}$\right)  = \frac{1}{2}(\frac{4-4\sqrt{3}+3}{4} + \sqrt{3}-\frac{3}{2}) =\frac{1}{8}.$
2) $A_X$ is on the interval ($2-\sqrt{3},\sqrt{3}).$ In this case, any value of $B_X$ will do, so the probability for the interval is simply $\frac{\sqrt{3}-(2-\sqrt{3})}{2} = \sqrt{3}-1.$

3) $A_X$ is on the interval ($\sqrt{3},2).$ This is identical, by symmetry, to case 1.

The total probability is therefore $\sqrt{3}-1+\frac{1}{4} = \frac{4\sqrt{3}-3}{4} \Rightarrow \boxed{E}$
## Solution 3
We first calculate the probability that the circles at are their maximum possible distance while still intersecting. Since the difference in heights is 1, and the two radii add up to 2 (at their point of tangency), we can see that the maximum possible distance for the two centers is $\sqrt3.$ If we look at possible placements for the lower point, we see that at placement (0,0) there is exactly $\sqrt3$ of space wherein we can put the top point. Similarly, at point (1,0) we can put the top point anywhere, resulting in 2 of space. If one looks at a diagram (which I can't put here), we can see that the space available for the top point increases linearly from (0,0) to ($2-\sqrt3,0).$ From then on to (1,0) it stops at 2 (this is symmetric for the other half of placements). If one draws a plot of the space available (which I again can't show here) with x determined by the x-value of the bottom point and y determined by space available for the top point, we notice two things: first, since for each (theoretically infinitesimally) small x-slice there is a line segment determining how much space there is available, if we sum up all of the line segments and divide by the total space (technically speaking by enumerating all the valid combinations and dividing by all of the general combinations), we will end up with a plot that looks like a rectangle with two small triangles cut out of it. Two, that since this is symmetric, we can just focus on the first half as the ratio of valid to total is the same. We see that the rectangle has a height of 2 and a width of 1, thus its area is 2. The triangle's height is $2-\sqrt3,$ and its width is the same thus its area is ($2-\sqrt3)^2/2 => (7-4\sqrt3)/2$. Now we simply subtract to obtain ($4\sqrt3-3)/2$ is the valid area, thus ($4\sqrt3-3)/4 \Rightarrow \boxed{E}$ is our solution.
## See Also
