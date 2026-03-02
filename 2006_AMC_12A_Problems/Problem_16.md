# 2006 AMC 12A Problem 16

> This problem is the same as [2006 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2006_AMC_12A_Problems) and [2006 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2006_AMC_10A_Problems/Problem_23).
## Problem
Circles with centers A and B have radius 3 and 8, respectively. A [ common internal tangent](https://artofproblemsolving.com/wiki/index.php/common_internal_tangent_line_) intersects the circles at C and D, respectively. Lines AB and CD intersect at E, and AE=5. What is CD?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2.5mm); defaultpen(fontsize(10pt)+linewidth(.8pt)); dotfactor=3; pair A=(0,0), Ep=(5,0), B=(5+40/3,0); pair M=midpoint(A--Ep); pair C=intersectionpoints(Circle(M,2.5),Circle(A,3))[1]; pair D=B+8*dir(180+degrees(C)); dot(A); dot(C); dot(B); dot(D); draw(C--D); draw(A--B); draw(Circle(A,3)); draw(Circle(B,8)); label("$A$",A,W); label("$B$",B,E); label("$C$",C,SE); label("$E$",Ep,SSE); label("$D$",D,NW);
```


$\textbf{(A) } 13\qquad\textbf{(B) } \frac{44}{3}\qquad\textbf{(C) } \sqrt{221}\qquad\textbf{(D) } \sqrt{255}\qquad\textbf{(E) } \frac{55}{3}\qquad$
## Solution
[Image:2006_AMC12A-$16a$.png](https://artofproblemsolving.com/wiki/index.php/Image:2006_AMC12A-16a.png)

$\triangle ADE \sim \triangle BCE$ because
$\angle AED$\cong $\angle BEC \text{ (vertical angles)}$
$\angle ADE$\cong $\angle BCE \text{ (tangent perpendicularity)}$

By the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem), line segment DE = 4.  The sides are proportional, so

$$\frac{DE}{AD} = \frac{CE}{BC} \Rightarrow \frac{4}{3} = \frac{CE}{8}\Rightarrow CE = \frac{32}{3}$$


And hence:
$$CD = CE + DE = 4 + \frac{32}{3} = \boxed{\textbf{(B) }\frac{44}{3}}$$
## See also
