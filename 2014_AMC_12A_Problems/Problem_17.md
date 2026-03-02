# 2014 AMC 12A Problem 17

## Problem
A $4\times 4\times$ h rectangular box contains a sphere of radius 2 and eight smaller spheres of radius 1.  The smaller spheres are each tangent to three sides of the box, and the larger sphere is tangent to each of the smaller spheres.  What is h?


> [Asymptote diagram - not rendered in Markdown]

```asy
import graph3; import solids; real $h=2+2$*sqrt(7); currentprojection=orthographic((0.75,-5,h/2+1),target=(2,2,h/2)); currentlight=light(4,-4,4); draw((0,0,0)--(4,0,0)--(4,4,0)--(0,4,0)--(0,0,0)^^(4,0,0)--(4,0,h)--(4,4,h)--(0,4,h)--(0,4,0)); draw(shift((1,3,1))*unitsphere,gray(0.85)); draw(shift((3,3,1))*unitsphere,gray(0.85)); draw(shift((3,1,1))*unitsphere,gray(0.85)); draw(shift((1,1,1))*unitsphere,gray(0.85)); draw(shift((2,2,h/2))*scale(2,2,2)*unitsphere,gray(0.85)); draw(shift((1,3,$h-1$))*unitsphere,gray(0.85)); draw(shift((3,3,$h-1$))*unitsphere,gray(0.85)); draw(shift((3,1,$h-1$))*unitsphere,gray(0.85)); draw(shift((1,1,$h-1$))*unitsphere,gray(0.85)); draw((0,0,0)--(0,0,h)--(4,0,h)^^(0,0,h)--(0,4,h));
```


$\textbf{(A) }2+2\sqrt 7\qquad \textbf{(B) }3+2\sqrt 5\qquad \textbf{(C) }4+2\sqrt 7\qquad \textbf{(D) }4\sqrt 5\qquad \textbf{(E) }4\sqrt 7\qquad$
## Solution 1 (Light Coordinate Geometry)
Let one of the corners be (0, 0, 0).
We can orient the box such that the center of the small sphere closest to the corner is (1,1,1), and the center of the large sphere is (2, 2, h/2).

Since the two spheres are tangent, the distance between their centers is  $1+2 = 3$, so $\sqrt{(2-1)^2+(2-1)^2+(h/2-1)^2} = 3.$ Solving, $h=2+2\sqrt{7}=\boxed{\textbf{(A)}}$
## Solution 2
Let A be the point in the same plane as the centers of the top spheres equidistant from said centers. Let B be the analogous point for the bottom spheres, and let C be the midpoint of $\overline{AB}$ and the center of the large sphere. Let D and E be the points at which line AB intersects the top of the box and the bottom, respectively.

Let O be the center of any of the top spheres (you choose!). We have AO=$1\cdot\sqrt{2},$ and CO=3, so AC=$\sqrt{3^2-\left(\sqrt2\right)^2}=\sqrt{7}.$ Similarly, BC=$\sqrt{7}. \overline{AD}$ and $\overline{BE}$ are clearly equal to the radius of the small spheres, 1. Thus the total height is AD+AC+BC+BE=2+$2\sqrt7,$ or $\boxed{\textbf{(A)}}.$

*~AwesomeToad*
## Solution 3
[none|500px|caption](https://artofproblemsolving.com/wiki/index.php/File:2014_AMC_12A_Problem_17.JPG)
Let A be the center of the large sphere and C be the center of any small sphere. Let D be a vertex of the rectangular prism closest to point C. Let F be the point on the edge of the prism such that $\overline{DF}$ and $\overline{AF}$ are perpendicular. Let points B and point E lie on $\overline{AF}$ and $\overline{DF}$ respectively such that $\overline{CE}$ and $\overline{CB}$ are perpendicular at C.

AC is the radii of the spheres, so AC=$2+1=3$. CE is the shortest length between the center of a small sphere and the edge of the prism, so CE=$\sqrt{2}.$ Similarly, AF=$2\sqrt{2}.$ Since CEFB is a rectangle, BF=CE=$\sqrt{2}.$ Since AF=$2\sqrt{2}, AB=AF - BF = \sqrt{2}.$ Then, BC=$\sqrt{3^2-\left(\sqrt2\right)^2}=\sqrt{7}=EF. DE$ is the length from C to the top of the prism or 1. Thus, DF=DE+EF=1+$\sqrt{7}.$ The prism is symmetrical, so h=2DF=$\boxed{\textbf{(A)}}$

*~BJHHar*
## Solution 4
Take a cross section and you will see that h is made up of the two radii of the circles plus some radical expression. The only choice satisfying this condition is $\boxed{\textbf{(A)}}.$
## See Also
