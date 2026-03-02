# 2010 AMC 12A Problem 13

## Problem
For how many integer values of k do the graphs of $x^2+y^2=k^2$ and xy = k not intersect?

$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 1 \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ 4 \qquad \textbf{(E)}\ 8$
## Solution 1
The image below shows the two curves for $k=4$. The blue curve is $x^2+y^2=k^2,$ which is clearly a circle with radius k, and the red curve is a part of the curve xy=k.


> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; size(200); real f(real x) {return 4/x;}; real g1(real x) {return sqrt(4*4-x*x);}; real g2(real x) {return -sqrt(4*4-x*x);}; draw(graph(f,-20./3,-0.6),red); draw(graph(f,0.6,20./3),red); draw(graph(g1,-4,4),blue); draw(graph(g2,-4,4),blue); axes("$x$","$y$");
```


In the special case $k=0$ the blue curve is just the point (0,0), and as $0\cdot 0=0,$ this point is on the red curve as well, hence they intersect.

The case k<0 is symmetric to k>0: the blue curve remains the same and the red curve is flipped according to the x axis. Hence we just need to focus on k>0.

Clearly, on the red curve there will always be points arbitrarily far from the origin: for example, as x approaches 0, y approaches $\infty.$ Hence the red curve intersects the blue one if and only if it contains a point whose distance from the origin is at most k.

At this point we can guess that on the red curve the point where x=y is always closest to the origin, and skip the rest of this solution.

For an exact solution, fix k and consider any point (x,y) on the red curve. Its distance from the origin is $\sqrt{ x^2 + (k/x)^2 }.$ To minimize this distance, it is enough to minimize $x^2 + (k/x)^2.$ By the [Arithmetic Mean-Geometric Mean Inequality](https://artofproblemsolving.com/wiki/index.php/Arithmetic_Mean-Geometric_Mean_Inequality) we get that this value is at least $2k$, and that equality holds whenever $x^2 = (k/x)^2, i.e.,x=\pm\sqrt$ k.

Now recall that the red curve intersects the blue one if and only if its closest point is at most k from the origin. We just computed that the distance between the origin and the closest point on the red curve is $\sqrt{2k}.$ Therefore, we want to find all positive integers k such that $\sqrt{2k} >$ k.

Clearly the only such integer is $k=1$, hence the two curves are only disjoint for $k=1$ and k=-1.
This is a total of $\boxed{2\ \textbf{(C)}}$ values.
## Solution 2
From the graph shown above, we see that there is a specific point closest to the center of the circle. Using some logic, we realize that as long as said furthest point is not inside or on the graph of the circle. This should be enough to conclude that the hyperbola does not intersect the circle.

Therefore, for each value of k, we only need to check said value to determine intersection. Let said point, closest to the circle have coordinates  (x, k/x)  derived from the equation. Then, all coordinates that satisfy $\sqrt{ x^2+ (k/x)^2 } \leq$ k  intersect the circle.
Squaring, we find  $x^2+(k/x)^2 \leqk^2.$
After multiplying through by  $x^2$  and rearranging, we find  $x^4-x^2k^2+k^2 \leq 0$ .
We see this is a quadratic $in  x^2$  and consider taking the determinant, which tells us that solutions are real when, after factoring:
$$k^2(k^2-4) \geq 0$$
We plot this inequality on the number line to find it is satisfied for all values except:  (-1, 0, 1) .
We then eliminate 0 because it is extraneous as both  xy=0  and  $x^2+y^2=0$  are points which coincide.
Therefore, there are a total of $\boxed{2\ \textbf{(C)}}$ values.
## Solution 3 (Algebra)
Since xy=k, multiply the equation by 2 on both sides to get $2xy=2k$. Now we can add the two equations to get $(x+y)^2=k^2+2k$, for which the only value of k that does not satisfy the equation is -1, as that makes the RHS negative. Similarly, if we subtract the two equations, we obtain $(x-y)^2=k^2-2k$, for which the only value of k that does not satisfy the equation is 1, for the same reason above.

Thus, the only values are $k = 1$, -1, giving us a total of $\boxed{2\ \textbf{(C)}}$ values.

*~ccx09 (Roy Short)*
## Solution 4 (Quick)
Multiply k=xy by k and substitute it into k^2=x^2+y^2. Then, $k=\frac{x^2+y^2}{xy}.$ Recognize it? It's also $k=\frac{x}{y}+\frac{y}{x}.$ The minimum of this function (more accurately the minimum absolute value of the function) is $k=2$, -2 (when x=y or x=-y). As long as k>2 or k<-2, the function is valid. As such, $k\neq1,-1 \implies \boxed{2\ \textbf{(C)}}.$ Elegant, huh?

~~BJHHar

~~~SnappyRiffs (talk)(minor edits;comment: solution was incomplete-this can lead to confusion)
## Solution 5
Assume that $k\ge 0$ since if k works then -k also works. Let x = ka and y = kb. Then the given equations become $ab =\frac{1}{k}$ and $a^2 + b^2 = 1,$ which we don't want to intersect. The points that are the closest on this graph are ($1/\sqrt{2}, 1/\sqrt{2})$ and ($1/\sqrt{k})(1/\sqrt{k}).$ We don't want the hyperbola to intersect or go inside the circle, so we require $1/\sqrt{k} > 1/\sqrt{2},$ so k< $2\impliesk = 0$, 1. Also, by symmetry k = -1 also works.Obviously $k = 0$ doesn't work, so we can discard that, leaving $\boxed{\mathbf{(C)}\quad 2}$ integral solutions for k
## Solution 6(Algebra)
To know when the system does not intersect, we first need to find when they do intersect. To do so, we substitute xy=k into $x^{2}+y^{2}=k^{2}$ giving:

$$x^2+y^2=(xy)^2$$

By Simon's Favorite Factoring Trick, we get 1=(1-x)(1+x)(1-y)(1+y)

Notice that other than for x and/or y equal to -1 and/or 1 because for any x or y we can get some coordinates that work even if they're fractions which through xy=k it can become an integer as $\dfrac{1}{2}\times2=1$

This means we have to exclude $xy=k=1$ or -1. This is $\boxed{2}$ values that do not work.

*~Batmanstark*
## Solution 7 (Trig)
The first equation is describing a circle with radius k centered at (0,0), so we can rewrite it in terms of a new variable $\theta$:

$$(k\cos(\theta))^2+(k\sin(\theta))^2=k^2.$$

A quick check shows that this identity holds since $\sin^2+\cos^2=1.$ Now, with an alternate expression for x and y, we can plug this into the second equation to get:

$$(k\sin(\theta))(k\cos(\theta))=k\rightarrow k^2\sin(\theta)\cos(\theta)=k.$$

Since the two equations does intersect when $k=0$ at (x,y)=(0,0), we do not need to consider the $k=0$ case, so we can safely divide both sides by $k^2 to$ get:

$$\sin(\theta)\cos(\theta)=\frac{1}{k}.$$

We can see that the intersections of these two equations will remain unchanged, only now that the solutions will be in terms of k and $\theta.$ Because the range of both $\sin$ and $\cos$ are limited to [0,1], the range of $\sin(\theta)\cos(\theta)$ will not exceed 1. However, the only way that the product could equal 1 is if both $\sin(\theta)$ and $\cos(\theta)$ to equal 1 at the same time, so since the maxima of the functions don't match up, this is an impossible case. Therefore, this equation will only have valid solutions when k>1, not at $k=1$. A quick sanity check with $\theta=\frac{\pi}{4}$ shows that $\frac{1}{k}=\frac{1}{2}$ and all values less than $\frac{1}{2}$ is indeed contained in the range.

For all k<0, symmetry about the y-axis will give an identical argument with the equation $\sin(\theta)\cos(\theta)=-\frac{1}{k},$ with k<-1 producing valid solutions for our system. Then, the only two values of k such that the system of equations won't intersect are 1 and -1, a total of $\boxed{2}$ values.

(Note: In the graph of f(x)=$\sin(x)\cos(x),$ the range of the function is actually even more restricted, being $\left$[$-\frac{1}{2},\frac{1}{2}\right$]. However, in a contest, observing that the value of |$\sin(x)\cos(x)$|<1 would suffice since the question is only asking for integer values of k.)

*~chz3369*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=0YwShc-9n-4
