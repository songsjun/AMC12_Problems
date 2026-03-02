# 2024 AMC 12B Problem 9

> This problem is the same as [2024 AMC 10B #14](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10B_Problems/Problem_14) and [2024 AMC 12B #9](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12B_Problems/Problem_9).
## Problem
A dartboard is the region $B$ in the coordinate plane consisting of points $(x, y)$ such that $|x| + |y| \le 8$. A target $T$ is the region where $(x^2 + y^2 - 25)^2 \le 49$. A dart is thrown and lands at a random point in B. The probability that the dart lands in $T$ can be expressed as $\frac{m}{n} \cdot \pi$, where $m$ and $n$ are relatively prime positive integers. What is $m + n$?

$\textbf{(A) }39 \qquad
$\textbf{(B) }71 \qquad$
$\textbf{(C) }73 \qquad$
$\textbf{(D) }75 \qquad$
$\textbf{(E) }135 \qquad$$
## Diagram
<asy>
// By Elephant200
// Feel free to adjust the code


> [Asymptote diagram - not rendered in Markdown]

```asy
size(10cm);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A = (8, 0);
pair B = (0, 8);
pair C = (-8, 0);
pair D = (0, -8);
draw(A--B--C--D--cycle, linewidth(1.5));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$(8,0)$", A, NE);
label("$(0,8)$", B, NE);
label("$(-8,0)$", C, NW);
label("$(0,-8)$", D, SE);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(circle((0,0),4*sqrt(2)), gray, linewidth(1.5));
filldraw(circle((0,0),3*sqrt(2)), white, linewidth(1.5));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-10, 0)--(10,0),EndArrow(5));
draw((10, 0)--(-10,0),EndArrow(5));
draw((0,-10)--(0,10), EndArrow(5));
draw((0,10)--(0,-10),EndArrow(5));
```

</asy>
*~Elephant200*
## Solution 1
Inequalities of the form $|x|+|y| \le 8$ are well-known and correspond to a square in space with centre at origin and vertices at $(8, 0)$, (-8, 0), (0, 8), (0, -8)$$.
The diagonal length of this square is clearly $16$, so it has an area of


$$\frac{1}{2} \cdot 16 \cdot 16 = 128$$


Now,


$$(x^2 + y^2 - 25)^2 \le 49$$


Converting to polar form,


$$r^2 - 25 \le 7 \implies r \le \sqrt{32},$$


and


$$r^2 - 25 \ge -7\implies r\ge \sqrt{18}.$$


The intersection of these inequalities is the circular region $T$ for which every circle in $T$ has a radius between $\sqrt{18}$ and $\sqrt{32}$, inclusive. The area of such a region is thus $\pi(32-18)=14\pi.$ The requested probability is therefore $\frac{14\pi}{128} = \frac{7\pi}{64},$ yielding $(m,n)=(7,64).$ We have $m+n=7+64=\boxed{\textbf{(B)}\ 71}.$

*~AbhiSood1234, countmath1*
## Solution 2 (Calculus)
Expressing the Area of Region $B$

Region $B$ consists of points where $|x| + |y| \le 8$

In each quadrant, this can be expressed by the following functions:

First quadrant: $y = 8 - x$
Second quadrant: $y = 8 + x$
Third quadrant: $y = -8 - x$
Fourth quadrant: $y = -8 + x$

In the first quadrant, $x$ ranges from 0 to 8, and $y$ ranges from 0 to $8 - x$. Thus, the area in the first quadrant is:


$$\text{Area of first quadrant} = \int_0^8 \int_0^{8 - x} \, dy \, dx$$


$$= \int_0^8 [y]_{y=0}^{y=8-x} \, dx = \int_0^8 (8 - x) \, dx$$


$$= \left[ 8x - \frac{x^2}{2} \right]_0^8 = 64 - 32 = 32$$


The total area of region $B$ is:


$$\text{Area of } B = 4 \times 32 = 128$$


Expressing the Area of Region $T$
Region $T$ is defined by the inequality $(x^2 + y^2 - 25)^2 \le 49$, which can be rewritten as:


$$18 \le x^2 + y^2 \le 32$$


To find the area, we switch to polar coordinates with $x = r \cos \theta$ and $y = r \sin \theta$, where $x^2 + y^2 = r^2$. Here, $r$ ranges from $\sqrt{18}$ to $\sqrt{32}$, and $\theta$ ranges from 0 to $\pi$.

The area of $T$ can then be found by:


$$\text{Area of } T = \int_0^{2\pi} \int_{\sqrt{18}}^{\sqrt{32}} r \, dr \, d\theta$$


$$= \int_0^{2\pi} \left[ \frac{r^2}{2} \right]_{r=\sqrt{18}}^{r=\sqrt{32}} \, d\theta = \int_0^{2\pi} \left( \frac{32}{2} - \frac{18}{2} \right) \, d\theta$$


$$= \int_0^{2\pi} 7 \, d\theta = 14\pi$$


The probability $P$ that a dart lands in region $T$ is the area of $T$ divided by the area of $B$:


$$P = \frac{\text{Area of } T}{\text{Area of } B} = \frac{14\pi}{128} = \frac{7\pi}{64}$$


So the probability is of the form $\frac{m}{n} \pi$, where $m = 7$ and $n = 64$, so $m + n = 7 + 64 = 71$.


$$\boxed{\textbf{(B)}\ 71}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Athmyx Athmyx]
## Solution 3
[thumb|center|600px|](https://artofproblemsolving.com/wiki/index.php/Image:_2024_AMC_12B_P09.jpeg)
*~Kathan*
## Video Solution 1 by Pi Academy (Fast and Easy ⚡🚀)
https://youtu.be/YqKmvSR1Ckk?feature=shared

*~Pi Academy*
## Video Solution 2 by SpreadTheMathLove
https://youtu.be/Zk9eW4lpTjo?si=qGMDoWy9WiNNG3yx
## Video Solution 3 by TheBeautyofMath
For AMC 10: https://youtu.be/dfF39udgqc8?t=1298 in Rapid Fire

For AMC 12: https://youtu.be/AKLPjTRPF4Q?t=727 in Rapid Fire

*~IceMatrix*
## See also
