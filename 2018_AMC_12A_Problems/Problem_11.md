# 2018 AMC 12A Problem 11

> This problem is the same as [2018 AMC 10A #13](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_13) and [2018 AMC 12A #11](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_11).
## Problem
A paper triangle with sides of lengths $3,4,$ and $5$ inches, as shown, is folded so that point $A$ falls on point $B$. What is the length in inches of the crease?
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(4,0)--(4,3)--(0,0));
label("$A$", (0,0), SW);
label("$B$", (4,3), NE);
label("$C$", (4,0), SE);
label("$4$", (2,0), S);
label("$3$", (4,1.5), E);
label("$5$", (2,1.5), NW);
fill(origin--(0,0)--(4,3)--(4,0)--cycle, gray);
```

</asy>
$\textbf{(A) }   1+\frac12 \sqrt2   \qquad        \textbf{(B) }   \sqrt3   \qquad    \textbf{(C) }   \frac74   \qquad   \textbf{(D) }  \frac{15}{8} \qquad  \textbf{(E) }   2$
## Solution 1 (Most Practical)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(4,0)--(4,3)--(0,0)); label("$A$", (0,0), SW); label("$B$", (4,3), NE); label("$C$", (4,0), SE);  label("$D$", (2,1.5), NW); label("$E$", (3.125,0), S);
draw ((2,1.5)--(3.125,0),linewidth(1));
draw(rightanglemark((0,0),(2,1.5),(3.125,0)));
```

</asy>

First, we need to realize that the crease line is just the perpendicular bisector of side $AB$, the hypotenuse of right triangle $\triangle ABC$. Call the midpoint of $AB$ point $D$. Draw this line and call the intersection point with $AC$ as $E$. Now, $\triangle ACB$ is similar to $\triangle ADE$ by $AA$ similarity. Setting up the ratios, we find that


$$\frac{BC}{AC}=\frac{DE}{AD} \Rightarrow \frac{3}{4}=\frac{DE}{\frac{5}{2}} \Rightarrow DE=\frac{15}{8}.$$


Thus, our answer is $\boxed{\textbf{(D) } \frac{15}{8}}$.
#### Note
In general, whenever we are asked to make a crease, think about that crease as a line of reflection over which the diagram is reflected. This is why the crease must be the perpendicular bisector of $AB$, because $A$ must be reflected onto $B$.
## Solution 2 (Very speedy, recommended if you are almost out of time)
Use the ruler and regular paper you brought to quickly draw a 3-4-5 triangle of any scale (don't trust the diagram in the booklet). Very carefully fold the acute vertices together and make a crease. Measure the crease with the ruler. If you were reasonably careful, you should see that it measures somewhat more than $\frac{7}{4}$ units and somewhat less than $2$ units. The only answer choice in that range is $\boxed{\textbf{(D) } \frac{15}{8}}$.

This is pretty much a cop-out, but it's allowed in the rules technically. This is basically useless for problems without diagrams.

~ (minor edits) <B+

~(minor edits) SwordAxe
(You can't bring graph paper to any of the AMC competitions).
## Solution 3
Since $\triangle ABC$ is a right triangle, we can see that the slope of line $AB$ is $\frac{BC}{AC}=\frac{3}{4}$. We know that if we fold $\triangle ABC$ so that point $A$ meets point $B$ the crease line will be perpendicular to $AB$ and we also know that the slopes of perpendicular lines are negative reciprocals of one another. Then, we can see that the slope of our crease line is $\frac{4}{3}$.
<asy>
pen dotstyle = black;


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(4,0)--(4,3)--(0,0));
fill(origin--(0,0)--(4,3)--(4,0)--cycle, gray);
```


dot((0,0),dotstyle);

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$A$", (0.03153837092244126,0.07822624343603715), SW);
```

dot((4,0),dotstyle);

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$C$", (4.028913881471271,0.07822624343603715), SE);
```

dot((4,3),dotstyle);

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$B$", (4.028913881471271,3.078221223847919), NE);
```

dot((2,1.5),dotstyle);

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$D$", (2.0341528211973956,1.578223733641978), SE);
```

dot((2,0),dotstyle);

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$E$", (2.0341528211973956,0.07822624343603715), NE);
```

dot((3.1249518689638927,0),dotstyle);

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$F$", (3.1571875913515854,0.07822624343603715), NE);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
label("$4$", (2,0), S);
label("$3$", (4,1.5), E);
label("$5$", (2,1.5), NW);
```

</asy>

Let us call the midpoint of $AB$ point $D$, the midpoint of $AC$ point $E$, and the crease line $DF$. We know that $DE$ is parallel to $BC$ and that $DE$'s length is $\frac{BC}{2}=\frac{3}{2}$. Using our slope calculation from earlier, we can see that$\frac{DE}{EF}=-\frac{\frac{3}{2}}{EF}=-\frac{4}{3}$. With this information, we can solve for $EF$:


$$-4EF=(-\frac{3}{2})(3) \Rightarrow -4EF=-\frac{9}{2} \Rightarrow 4EF=\frac{9}{2} \Rightarrow EF=\frac{9}{8}.$$


We can then use the Pythagorean Theorem to find $DF$.


$$\frac{3}{2}^2+\frac{9}{8}^2=DF^2 \Rightarrow \frac{9}{4}+\frac{9\cdot9}{8\cdot8}=DF^2 \Rightarrow \frac{9\cdot2\cdot8}{4\cdot2\cdot8}+\frac{9\cdot9}{8\cdot8}=DF^2 \Rightarrow \frac{9\cdot2\cdot8+9\cdot9}{8\cdot8}=DF^2 \Rightarrow \frac{9(2\cdot8+9)}{8\cdot8}=DF^2$$


$$\Rightarrow DF=\sqrt{\frac{9(2\cdot8+9)}{8\cdot8}} \Rightarrow DF=\frac{3\cdot5}{8} \Rightarrow DF=\frac{15}{8}$$


Thus, our answer is $\boxed{\textbf{(D) } \frac{15}{8}}$.

~ (minor edits) <B+
## Solution 4
Make use of the diagram in Solution 3. It can be deduced that $AF=BF$. Let $DF=x$. In $\triangle ADF$, $AF^2=x^2+2.5^2 \Rightarrow AF=\sqrt{x^2+2.5^2}$. Then $FC$ also would be $\sqrt{x^2+2.5^2}$.

In $\triangle BCF$, $BF^2=FC^2+BC^2 \Rightarrow (\sqrt{x^2+2.5^2})^2=(4-\sqrt{x^2+2.5^2})^2+3^2$. After some quick math, we get $\sqrt{x^2+2.5^2}=\frac{25}{8}$.
Solving for $x$ will give $x=\frac{15}{8}$.

$\thereforeDF=x=\boxed{\textbf{(D) } \frac{15}{8}}$.
## Solution 5
Like in Solution 3, we can make use of coordinate geometry to solve this problem. Because the length of the crease is constant no matter the positioning of the triangle, reorient the triangle so it has C at the origin and B and A at $(0,3)$ and $(4,0)$ respectively.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(0,3)--(4,0)--(0,0));
label("$C$", (0,0), SW); label("$B$", (0,3), NW); label("$A$", (4,0), SE);
draw ((2,1.5)--(0.875,0),blue+linewidth(1));
label("$(\frac{7}{8},0)$", (0.875,0), S); label("$(2,\frac{3}{2})$", (2,1.5), NE);
draw(rightanglemark((4,0),(2,1.5),(0.875,0)));
```

</asy>

We know that each point in the crease is equidistant from $A$ and $B$, so the crease must pass through the midpoint of $AB$, which is $({2,\frac{3}{2}})$ , and be perpendicular to hypotenuse $AB$. The crease therefore has a slope of $\frac{4}{3}$.

Plugging into point-slope we find that the equation of the crease is, $y-y_1=m(x-x_1)\implies \frac{3}{2}=\frac{4}{3}(x-2)\implies \frac{4}{3}\frac{7}{6}$

Using 0 for y, we see that the crease intersects $AC$ at $(\frac{7}{8},0)$.

By the Distance Formula,

$(2-\frac{7}{8})^2+({\frac{3}{2}})^2=d^2 \implies d^2=\frac{225}{64} \implies d=\boxed{\textbf{(D) }\frac{15}{8}}$
## Solution 6
Let $D$ be a point on AC such that $AD=DB$ and $\triangle{ADB}$ is isosceles. The altitude of this triangle is the crease of the paper triangle.

Setting $DC=x$, we have a right triangle $\triangle{BCD}$ with legs of x and 3, and, because $AD=DB,$ hypotenuse of $(4-x)$.

$x^2+3^2=(4-x)^2 \implies x^2+9=16-8x+x^2 \implies 8x=7 \implies x=\frac{7}{8}$

The area of $\triangle{BCD}  \text{ is thus} = \frac{7}{8}*3*\frac{1}{2} \implies \frac{21}{16}.$ Because $[ADB]=[ABC]-[BCD],$ we can plug in and see that $[ADB]=6-\frac{21}{16}=\frac{75}{16}.$

Since $A=\frac{bh}{2}$, we get $\frac{75}{16}=\frac{5h}{2} \implies 5\frac{75}{8} \implies \boxed{\textbf{(D) }\frac{15}{8}}$
## Video Solution (HOW TO THINK CREATIVELY!)
https://youtu.be/92WxfAyVumE

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/HJALwsbHZXc

*~Whiz*
## Video Solution by OmegaLearn
https://youtu.be/4_x1sgcQCp4?t=2623

*~pi_is_3.14*
## See Also
