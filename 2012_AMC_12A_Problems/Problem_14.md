# 2012 AMC 12A Problem 14

> This problem is the same as [2012 AMC 12A #14](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem 18
The closed curve in the figure is made up of 9 congruent circular arcs each of length $\frac{2\pi}{3}$, where each of the centers of the corresponding circles is among the vertices of a regular hexagon of side 2. What is the area enclosed by the curve?

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2cm);
defaultpen(fontsize(6pt));
dotfactor=4;
label("$\circ$",(0,1));
label("$\circ$",(0.865,0.5));
label("$\circ$",(-0.865,0.5));
label("$\circ$",(0.865,-0.5));
label("$\circ$",(-0.865,-0.5));
label("$\circ$",(0,-1));
dot((0,1.5));
dot((-0.4325,0.75));
dot((0.4325,0.75));
dot((-0.4325,-0.75));
dot((0.4325,-0.75));
dot((-0.865,0));
dot((0.865,0));
dot((-1.2975,-0.75));
dot((1.2975,-0.75));
draw(Arc((0,1),0.5,210,-30));
draw(Arc((0.865,0.5),0.5,150,270));
draw(Arc((0.865,-0.5),0.5,90,-150));
draw(Arc((0.865,-0.5),0.5,90,-150));
draw(Arc((0,-1),0.5,30,150));
draw(Arc((-0.865,-0.5),0.5,330,90));
draw(Arc((-0.865,0.5),0.5,-90,30));
```

</asy>

$\textbf{(A)}\ 2\pi+6\qquad\textbf{(B)}\ 2\pi+4\sqrt{3}\qquad\textbf{(C)}\ 3\pi+4\qquad\textbf{(D)}\ 2\pi+3\sqrt{3}+2\qquad\textbf{(E)}\ \pi+6\sqrt{3}$
## Solution 1
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2cm);
defaultpen(fontsize(6pt));
dotfactor=4;
label("$\circ$",(0,1));
label("$\circ$",(0.865,0.5));
label("$\circ$",(-0.865,0.5));
label("$\circ$",(0.865,-0.5));
label("$\circ$",(-0.865,-0.5));
label("$\circ$",(0,-1));
dot((0,1.5));
dot((-0.4325,0.75));
dot((0.4325,0.75));
dot((-0.4325,-0.75));
dot((0.4325,-0.75));
dot((-0.865,0));
dot((0.865,0));
dot((-1.2975,-0.75));
dot((1.2975,-0.75));
draw(Arc((0,1),0.5,210,-30));
draw(Arc((0.865,0.5),0.5,150,270));
draw(Arc((0.865,-0.5),0.5,90,-150));
draw(Arc((0.865,-0.5),0.5,90,-150));
draw(Arc((0,-1),0.5,30,150));
draw(Arc((-0.865,-0.5),0.5,330,90));
draw(Arc((-0.865,0.5),0.5,-90,30));
draw((0,1)--(0.865, 0.5)--(0.865,-0.5)--(0,-1)--(-0.865,-0.5)--(-0.865,0.5)--(0,1));
```

</asy>

We can draw the hexagon between the centers of the circles, and compute its area. The hexagon is made of $6$ equilateral triangles each with length $2$, so the area is:


$$\frac{\sqrt{3}}{4} \cdot 2^2 \cdot 6=6 \sqrt{3}.$$


Then, we add the areas of the three sectors outside the hexagon:


$$\frac 23 \pi \cdot 3=2\pi.$$


We now subtract the areas of the three sectors inside the hexagon but outside the figure (which is $\pi$) to get the area enclosed in the curved figure:


$$6 \sqrt{3}+2\pi-\pi=\pi+6\sqrt{3}.$$


Hence, our answer is $\boxed{\textbf{(E)}\ \pi+6\sqrt{3}},$ and we are done.


$$


(Minor edits, made by dbnl.)
## Solution 2 (Looking at the answer choices)
After forming the hexagon using the sectors outside the hexagon, we see three sectors left. Each sector has an area of $\frac{\pi}{3},$ so the three combined make $\pi.$ Since the side length of the hexagon is $2,$ its area doesn't have $\pi$ in it, so we know that the final answer will be $\pi + \text{(area of the hexagon)}.$ Looking at the answer choices, the only answer with only one $\pi$ is $\boxed{\textbf{(E)}}.$

Also, notice the problem consists of adding and subtracting arcs from a hexagon with an area of $\sqrt{3}$. Since all of the arcs have $\pi$ in them, they will not affect the area of the hexagon, which is $\sqrt{3}$, in the final answer. Thus, the only possible solution is $\boxed{E}$. ~Extremelysupercooldude
## Solution 3 (Areas)
As you can see, this diagram looks like a fidget spinner ;). Fidget spinners aside, we need to add stuff to our diagram to make it look easier. In the directions, they were talking about the centers of each arc create a hexagon, so let's add that to our diagram.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(fontsize(6pt));
dotfactor=4;
label("$\circ$",(0,1));
label("$\circ$",(0.865,0.5));
label("$\circ$",(-0.865,0.5));
label("$\circ$",(0.865,-0.5));
label("$\circ$",(-0.865,-0.5));
label("$\circ$",(0,-1));
dot((0,1.5));
dot((-0.432,0.75));
dot((0.4325,0.75));
dot((-0.4325,-0.75));
dot((0.4325,-0.75));
dot((-0.865,0));
dot((0.865,0));
dot((-1.2975,-0.75));
dot((1.2975,-0.75));
draw(Arc((0,1),0.5,210,-30));
draw(Arc((0.865,0.5),0.5,150,270));
draw(Arc((0.865,-0.5),0.5,90,-150));
draw(Arc((0.865,-0.5),0.5,90,-150));
draw(Arc((0,-1),0.5,30,150));
draw(Arc((-0.865,-0.5),0.5,330,90));
draw(Arc((-0.865,0.5),0.5,-90,30));
draw((0,1)--(0.865, 0.5)--(0.865,-0.5)--(0,-1)--(-0.865,-0.5)--(-0.865,0.5)--(0,1));
```

</asy>

The side length of the hexagon is 2 and if we plug it in to the area of a regular hexagon formula $\frac{3\sqrt 3}{2}s^2$ we get $\sqrt 3$.

Note that the interior angles of a regular hexagon is 120 because of the formula $\frac{180(n-2)}{n}$ where n is the number of sides. Knowing that, each sector is $\frac{1}{3}$ of a circle. This would mean the three sectors inside the hexagon altogether equal a full circle. Knowing that the radius is 1, we can use the area of a circle $\pi r^2$ and subtract it to $\sqrt 3$. Thus we get the total area of $\sqrt 3 - \pi$.


Notice that we have three sectors exterior to the hexagon. Realize that the central angles of a circle always sum up to 360. Since we know one of the central angles is equal to 120, then we subtract 360 to 120 which gives us 240. Knowing that, each sector is $\frac{2}{3}$ of a circle and since there is 3 of them, $\frac{2}{3}*3=2$ circles. To find the area of those circles, we have to use $\pi r^2$ again, but since there are 2 circles, then it is $\pi r^2$, which gives us $\pi$.

Now we have enough information to find the total area,

$(6\sqrt 3 -\pi+2\pi)=\textbf{(E)}\ \pi+6\sqrt{3}$

*~ghfhgvghj10*
## See Also
