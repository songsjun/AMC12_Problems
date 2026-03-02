# 2016 AMC 12A Problem 8

## Problem
Find the area of the shaded region.

<asy>


> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm);
defaultpen(fontsize(9pt));
draw((0,0)--(8,0)--(8,5)--(0,5)--cycle);
filldraw((7,0)--(8,0)--(8,1)--(0,4)--(0,5)--(1,5)--cycle,gray(0.8));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(1/2,5),dir(90));
label("$7$",(9/2,5),dir(90));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(8,1/2),dir(0));
label("$4$",(8,3),dir(0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(15/2,0),dir(270));
label("$7$",(7/2,0),dir(270));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(0,9/2),dir(180));
label("$4$",(0,2),dir(180));
```


</asy>

$\textbf{(A)}\ 4\dfrac{3}{5} \qquad \textbf{(B)}\ 5\qquad \textbf{(C)}\ 5\dfrac{1}{4} \qquad \textbf{(D)}\ 6\dfrac{1}{2} \qquad \textbf{(E)}\ 8$
## Solution 1
<asy>


> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm);
defaultpen(fontsize(9pt));
draw((0,0)--(8,0)--(8,5)--(0,5)--cycle);
filldraw((7,0)--(8,0)--(8,1)--(0,4)--(0,5)--(1,5)--cycle,gray(0.8));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(1/2,5),dir(90));
label("$7$",(9/2,5),dir(90));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(8,1/2),dir(0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(15/2,0),dir(270));
label("$7$",(7/2,0),dir(270));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(0,9/2),dir(180));
label("$4$",(0,2),dir(180));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,5)--(8,0));
```


</asy>

The bases of these triangles are all $1$, and by symmetry, their heights are $4$, $\frac{5}{2}$, $4$, and $\frac{5}{2}$. Thus, their areas are $2$, $\frac{5}{4}$, $2$, and $\frac{5}{4}$, which add to the area of the shaded region, which is $\boxed{6\frac{1}{2}}$.
## Solution 2
Find the area of the unshaded area by calculating the area of the triangles and rectangles outside of the shaded region. We can do this by splitting up the unshaded areas into various triangles and rectangles as shown.

<asy>


> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm);
defaultpen(fontsize(9pt));
draw((0,0)--(8,0)--(8,5)--(0,5)--cycle);
filldraw((7,0)--(8,0)--(8,1)--(0,4)--(0,5)--(1,5)--cycle,gray(0.8));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(1/2,5),dir(90));
label("$4$",(6,5),dir(90));
label("$3$",(5/2,5),dir(90));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(8,1/2),dir(0));
label("$5/2$",(8,15/4),dir(0));
label("$3/2$",(8,7/4),dir(0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(15/2,0),dir(270));
label("$4$",(2,0),dir(270));
label("$3$",(11/2,0),dir(270));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(0,9/2),dir(180));
label("$5/2$",(0,5/4),dir(180));
label("$3/2$",(0,13/4),dir(180));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,5/2)--(8,5/2));
draw((4,0)--(4,5));
```


</asy>

Notice that the two added lines bisect each of the $4$ sides of the large rectangle.

Subtracting the unshaded area from the total area gives us $\frac{1}{2}=\boxed{6\frac{1}{2}}$, so the correct answer is $\boxed{\textbf{(D)}}$.
## Solution 3
Notice that we can graph this on the coordinate plane.

The top-left shaded figure has coordinates of $(1,5), (0,5), (0,4), \left(4,\frac{5}{2}\right)$.

Notice that we can apply the shoelace method to find the area of this polygon.

We find that the area of the polygon is $\frac{13}{4}$.

However, notice that the two shaded regions are two congruent polygons.

Hence, the total area is $\frac{13}{2}\implies \boxed{6\frac{1}{2}}$  or  $\boxed{D}$.
## Solution 4
<asy>


> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm);
defaultpen(fontsize(9pt));
draw((0,0)--(8,0)--(8,5)--(0,5)--cycle);
filldraw((7,0)--(8,0)--(0,5)--(1,5)--cycle,gray(0.7));
filldraw((8,0)--(8,1)--(0,4)--(0,5)--cycle,gray(0.9));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(1/2,5),dir(90));
label("$7$",(9/2,5),dir(90));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(8,1/2),dir(0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(15/2,0),dir(270));
label("$7$",(7/2,0),dir(270));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$1$",(0,9/2),dir(180));
label("$4$",(0,2),dir(180));
```


</asy>

Split the region into four parts by the diagonal from the top left to the bottom right. Slide the top and bottom pieces next to each other to form a parallelogram with base $1$ and height $\frac{5}{2}$, and slide the left and right pieces next to each other to form a parallelogram with base $1$ and height $\frac{8}{2}$. The total area is then $\cdot\frac{5}{2}+1\cdot\frac{8}{2} = \frac{(5+8)(1)}{2} = \boxed{\textbf{(D)}\ 6\frac{1}{2}}$. ~emerald_block
## Solution 5
<asy>


> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm);
defaultpen(fontsize(9pt));
draw((0,0)--(8,0)--(8,5)--(0,5)--cycle);
filldraw((7,0)--(8,0)--(8,1)--(0,4)--(0,5)--(1,5)--cycle,gray(0.8));
filldraw((1,0)--(0,0)--(0,1)--(8,4)--(8,5)--(7,5)--cycle,gray(0.8));
label("$1$",(1/2,5),dir(90));
label("$6$",(4,5),dir(90));
label("$1$",(15/2,5),dir(90));
label("$1$",(8,1/2),dir(0));
label("$3$",(8,5/2),dir(0));
label("$1$",(8,9/2),dir(0));
label("$1$",(15/2,0),dir(270));
label("$6$",(4,0),dir(270));
label("$1$",(1/2,0),dir(270));
label("$1$",(0,9/2),dir(180));
label("$3$",(0,5/2),dir(180));
label("$1$",(0,1/2),dir(180));
```

</asy>

We can subtract the 4 triangular areas from the overall rectangle. It can be noticed that two triangles have area $\frac{6 \cdot \frac{5}{2}}{2} = \frac{15}{2}$, and the other two triangles have area $\frac{3 \cdot \frac{8}{2}}{2} = 6\Rightarrow$ the shaded area is $(8 \cdot 5) - 2(\frac{15}{2}) - 2(6) = 40 - 15 - 12 = 13$. Since the desired area is half the shaded region, our area is $\boxed{\textbf{(D)}\ 6\frac{1}{2}}$.

*~Champion1234*
## Solution 6 (Calculus)
Note that the area before and after the intersection is the same, so we can just consider the area before the intersection and double it to get the total area of the shaded region.

There are two linear lines that can be labeled. The first intersects the side of length 5; By letting the bottom left side of the triangle be defined as (0,0), its slope is $m = \frac{1-4}{8-0} = -\frac{3}{8}$. Therefore,
$\\ y_1 = -\frac{3}{8}x + b$
$\\ y_1(0) = b = 4$
$\\ y_1 = -\frac{3}{8}x + 4$

The second line's equation can be found in a similar fashion. Its slope is $m = \frac{0-5}{7-1} = -\frac{5}{6}$
$\\ y_2 = -\frac{5}{6}x + b$
$\\ y_2(7) = -\frac{35}{6} + b = 0$
$\\ b = \frac{35}{6}$
$\\ y_2 = -\frac{5}{6}x + \frac{35}{6}$

Now we can take the area between lines. One thing to note is that we have to start at the point (1,5) because the rest of $y_2$ is outside of the rectangle.

The area of the remaining shaded part from [0,1) can also be found using an integral. Assume the top side of the rectangle is defined as $y = 5$. We can find the area between the lines by integrating the expression $5 - y_1$.

Now where do the lines meet?
$\\ y_1 = y_2$
$\\ -\frac{3}{8}x + 4 = -\frac{5}{6}x + \frac{35}{6}$
Solving for x yields 4, so the graphs intersect at $x = 4$.

Now we can integrate.

$Area_{shaded} = 2Area_{[0,1)} + 2Area_{(1,4]}$
$2Area_{[0,1)} = 2\int_0^1 5 - (-\frac{3}{8}x + 4) dx

$$
\\ = 2\int_0^1 1 + \frac{3}{8}x dx = 2(x + \frac{3}{16}x^2) \left.\right|_{\;0}^{\;1}
\\ = 2(1 + \frac{3}{16}1^2) = 2\frac{19}{16} = \frac{19}{8}$
$$

$\\ 2Area_{(1,4]} = 2\int_1^4 y_2 - y_1 dx = 2\int_1^4 (-\frac{5}{6}x + \frac{35}{6}) - (-\frac{3}{8}x + 4) dx

$$
\\ = 2\int_1^4 (-\frac{5}{6} + \frac{3}{8})x + \frac{35}{6} - 4 dx
\\ = 2\int_1^4 -\frac{11}{24}x + \frac{11}{6} dx = 2(-\frac{11}{48}x^2 + \frac{11}{6}x)\left.\right|_{\;1}^{\;4}
\\ = 2((-\frac{11}{48}4^2 + \frac{11}{6}4) - (-\frac{11}{48}1^2 + \frac{11}{6}1)) = 2\frac{33}{16} = \frac{33}{8}$
$$


$Area_{shaded} = 2Area_{[0,1)} + 2Area_{(1,4]} = \frac{19}{8} + \frac{33}{8} = \frac{19+33}{8} = \frac{52}{8} = \frac{13}{2} = 6.5$

Therefore, the answer is $\boxed{\textbf{(D)}\ 6\frac{1}{2}}$

*~juicefruit*
## Video Solution (CREATIVE THINKING)
https://youtu.be/uxgX8h5fWrs

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/dHY8gjoYFXU

*~IceMatrix*

https://www.youtube.com/watch?v=WojyKGOEk_g
## Video Solution by OmegaLearn
https://youtu.be/4_x1sgcQCp4?t=652

*~pi_is_3.14*
## See Also
