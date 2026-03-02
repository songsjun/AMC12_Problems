# 2011 AMC 12A Problem 17

## Problem
Circles with radii 1, 2, and 3 are mutually externally tangent. What is the area of the triangle determined by the points of tangency?

$\textbf{(A)}\ \frac{3}{5} \qquad \textbf{(B)}\ \frac{4}{5} \qquad \textbf{(C)}\ 1 \qquad \textbf{(D)}\ \frac{6}{5} \qquad \textbf{(E)}\ \frac{4}{3}$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(.5cm); defaultpen(linewidth(.8pt)); dotfactor=4; pair A=(0,0), B=(3,0), C=(0,4); dot (A); dot (B); dot (C); draw(A--B); draw(A--C); draw(B--C); draw(Circle(A,1)); draw(Circle(B,2)); draw(Circle(C,3));
```


The centers of these circles form a 3-4-5 triangle, which has an area equal to 6.

The areas of the three triangles determined by the center and the two points of tangency of each circle are, using Triangle Area by Sine,

$$\frac{1}{2} \cdot 1 \cdot 1 \cdot 1 = \frac{1}{2}$$

$$\frac{1}{2} \cdot 2 \cdot 2 \cdot \frac{4}{5} = \frac{8}{5}$$

$$\frac{1}{2} \cdot 3 \cdot 3 \cdot \frac{3}{5} = \frac{27}{10}$$

which add up to 4.8. The area we're looking for is the large 3-4-5 triangle minus the three smaller triangles, or 6 - 4.8 = 1.2 = $\frac{6}{5} \rightarrow \boxed{(D)}.$
## Solution 2 (Analytical)
Let $O_1,O_2,O_3$ be the centers of the circles with radii 1,2,3. Notice that the points of tangency of the 3 circles are also the points of tangency of the incircle of $\triangle O_1O_2O_3.$ Using the radius of an Incircle formula, $r =\frac{A}{S}$ where S is the semi-perimeter, and noting that $\triangle O_1O_2O_3$ is a 3-4-5 right triangle, we see that, $r =\frac{3 \cdot 4/2}{\frac{3+4+5}{2}} = 1.$
Now we set $\triangle O_1O_2O_3$ on the coordinate plane with $O_1=(0,0),O_2=(3,0), O_3$ = (0,4). So the incenter lies on (1,1). Let the points of tangency of $\triangle O_1O_2O_3$ with it's incenter are A,B,C with A on $O_1O_2$, B on $O_1O_3$, and C on $O_2O_3$. We have that A = (1,0), B=(0,1). Since the line defined by C and the incenter is perpendicular to $O_2O_3$ who has equation $y =\frac{-4}{3}$x + 4, we have it's equation as ($y-1) = \frac{3}{4}(x-1) \rightarrowy =\frac{3}{4}$x + $\frac{1}{4}.$ We have the intersection of the 2 lines at, $\begin{align*}\frac{-4}{3}$x + 4 &= $\frac{3}{4}$x + $\frac{1}{4}$ \\ $\frac{15}{4}$ &= $\frac{25}{12}$x \\ x &= $\frac{9}{5}$ \\ y &= $\frac{-4}{3} \frac{9}{5} + 4 = \frac{8}{5}.\end{align*}$
Here we can use Shoelace Theorem on the points ($\frac{9}{5}, \frac{8}{5}),(0,1),(1,0)$ we get our areas as $\frac{6}{5} \rightarrow \boxed{(D)}.$

*~Aaryabhatta1*
## See also
