# 2019 AMC 12B Problem 15

> This problem is the same as [2019 AMC 10B #20](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10B_Problems) and [2019 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12B_Problems).
## Problem
As shown in the figure, line segment $\overline{AD}$ is trisected by points B and C so that AB=BC=CD=2. Three semicircles of radius 1, \overarc{AEB},\overarc{BFC}, and \overarc{CGD}, have their diameters on $\overline{AD},$ lie in the same halfplane determined by line AD, and are tangent to line EG at E,F, and G, respectively. A circle of radius 2 has its center on F.  The area of the region inside the circle but outside the three semicircles, shaded in the figure, can be expressed in the form
$$\frac{a}{b}\cdot\pi-\sqrt{c}+d,$$
where a,b,c, and d are positive integers and a and b are relatively prime. What is a+b+c+d?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm); filldraw(circle((0,0),2), grey); filldraw(arc((0,-1),1,0,180) -- cycle, gray(1.0)); filldraw(arc((-2,-1),1,0,180) -- cycle, gray(1.0)); filldraw(arc((2,-1),1,0,180) -- cycle, gray(1.0)); dot((-3,-1)); label("$A$",(-3,-1),S); dot((-2,0)); label("$E$",(-2,0),NW); dot((-1,-1)); label("$B$",(-1,-1),S); dot((0,0)); label("$F$",(0,0),N); dot((1,-1)); label("$C$",(1,-1), S); dot((2,0)); label("$G$", (2,0),NE); dot((3,-1)); label("$D$", (3,-1), S);
```


$\textbf{(A) } 13 \qquad\textbf{(B) } 14 \qquad\textbf{(C) } 15 \qquad\textbf{(D) } 16\qquad\textbf{(E) } 17$
## Solution 1
This solution is essentially the same, but is much more clear and easier to understand, than Solution 2. I will TeX this at a later time, but if anyone wants to help in the mean time, please do -- thanks!!

[File:10b20.png](https://artofproblemsolving.com/wiki/index.php/File:10b20.png)

*~mathboy282*
## Solution 2
Divide the circle into four parts: the top semicircle by connecting E, F, and G(A); the bottom sector (B), whose arc angle is $120^{\circ}$ because the large circle's radius is 2 and the short length (the radius of the smaller semicircles) is 1, giving a $30^{\circ}-60^{\circ}-90^{\circ}$ triangle; the triangle formed by the radii of A and the chord (C); and the four parts which are the corners of a circle inscribed in a square (D). Then the area is A + B - C + D (in B-C, we find the area of the bottom shaded region, and in D we find the area of the shaded region above the semicircles but below the diameter).

The area of A is $\frac{1}{2} \pi \cdot 2^2 = 2\pi.$

The area of B is $\frac{120^{\circ}}{360^{\circ}} \pi \cdot 2^2 = \frac{4\pi}{3}.$

For the area of C, the radius of 2, and the distance of 1 (the smaller semicircles' radius) to BC, creates two $30^{\circ}-60^{\circ}-90^{\circ}$ triangles, so C's area is 2 $\cdot \frac{1}{2} \cdot 1 \cdot \sqrt{3} = \sqrt{3}.$

The area of D is 4 $\cdot 1-\frac{1}{4}\pi \cdot 2^2=4-\pi.$

Hence, finding A+B-C+D, the desired area is $\frac{7\pi}{3}-\sqrt{3}+4,$ so the answer is $7+3+3+4=\boxed{\textbf{(E) } 17}.$

----------

Note from ~milquetoast: I found this solution incredibly unspecific and difficult to understand, especially in defining C,  because of the wording. I think what this solution is trying to say is the same as the second video solution down below.

Note: Wow that is harsh

Note from ~$\frac{a}{b}\cdot\pi-\sqrt{c}+d,$ but we don't need to get there. We will use a very handy technique called [https://artofproblemsolving.com/wiki/index.php/Fakesolving?srsltid=AfmBOooIYJBasY2JG2w6ib8tmkZzk_s4gHj3D43Dmllv1jje2xbw7KzG Fakesolving]. We start with seeing that the diameter of the full circle is greater than 2 but less than and almost 4, so, we multiply with something greater than 1.5 and, through [https://artofproblemsolving.com/wiki/index.php/Fakesolving?srsltid=AfmBOooIYJBasY2JG2w6ib8tmkZzk_s4gHj3D43Dmllv1jje2xbw7KzG Fakesolving] we say that the diameter is $\sqrt{3}$ which means the radius is $\sqrt{3}$. This means the area of the full circle is $\pi$. Next, we start [https://artofproblemsolving.com/wiki/index.php/Fakesolving?srsltid=AfmBOooIYJBasY2JG2w6ib8tmkZzk_s4gHj3D43Dmllv1jje2xbw7KzG Fakesolving] the assumption that the regions outside the full circle but inside the smaller semicircles are $\frac{\sqrt{3}}{3} \cdot \frac{1}{2} \cdot 2 = \frac{2\sqrt{3}}{6}$ each. This means that the smaller half circle that lies inside of the full circle has an area of $\frac{1}{2} \pi$. The inside regions of the smaller 3 half circles that lie inside of the full circle have a combined area of $\frac{2\sqrt{3}}{6}$. The area is then $\pi - (\frac{2\sqrt{3}}{6} + \frac{1}{2} \pi)$. Therefore we can say that this could be simplified into the form  $\frac{a}{b} \cdot \pi - \sqrt{c} +$ d,  We just add our entire result, to get $3 + 2 + 3 + 6 + 1 + 2 = \boxed{\textbf{(E) } 17}$. ~Pinotation
## Solution 4
First we have to solve the area of the non-shaded area(the semicircles) that are in Circle F.The middle semicircle has area $\frac12\pi$ and the other two have about half of their are inside the circle = $\frac14\pi$\ + $\frac14\pi$\ + $\frac12\pi$\ = $\pi.$ Then we subtract the part of the quartercircle that isn't in Circle F. This is an area equal to that of a triangle minus an minor segment. The height of the triangle is the radius of the semicircles, which is 1. The length is the radius of Circle F minus the length from the center of the middle semicircle up to until it is on the edge of the circle. Using the Pythagorean Theorem we can figure out that the length is: $\sqrt{2^2 - 1^2} = \sqrt{3}.$ This means that the length of the triangle is 2 - $\sqrt{3}$ and so the area of the triangle is $\frac{2 - \sqrt{3}}{2}.$ For the area of the segment, it's the area of the sector minus the area of the triangle. The triangle's length is the radius of F: 2, while its height is the radius of the semicircles: 1, so the area is 1. The angle is $30^{\circ}$ as the hypotenuse is the radius of F and the opposite side is the radius of the semicircles, which means the area is $\frac{1}{12}$ of the whole area, which is $4\pi$ so the area of the sector is $\frac{\pi}{3}$ and the area of the segment is $\frac{\pi}{3} - 1$ and so the area of the part of the quartercircles that stick out of Circle F is: ($\frac{2 - \sqrt{3}}{2})-(\frac{\pi}{3} - 1) = \frac{2 - \sqrt{3}}{2} + 1 - \frac{\pi}{3} = \frac{4 - \sqrt{3}}{2} - \frac{\pi}{3}.$ Since there are two, one for each side, we have to multiply it by 2, so we have {4 - $\sqrt{3}$} - $\frac{2\pi}{3},$ which we subtract from $\pi$ which gets us $\frac{5\pi}{3} - 4 + \sqrt{3}$ which we subtract from $4\pi = \frac{12\pi}{3},$ which is $\frac{7\pi}{3} + 4 - \sqrt{3}$ so we get $7+3+4+3=\boxed{\textbf{(E) } 17}.$
## Video Solution by Education, the Study of Everything
https://youtu.be/nhDYNevwH1g ~Education, the Study of Everything
## Video Solution by OmegaLearn
https://youtu.be/t3EWtMnJu2Y?t=516 ~pi_is_3.14
## See Also
