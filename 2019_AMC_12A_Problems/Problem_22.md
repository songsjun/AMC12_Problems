# 2019 AMC 12A Problem 22

## Problem
Circles $\omega$ and $\gamma,$ both centered at O, have radii 20 and 17, respectively. Equilateral triangle ABC, whose interior lies in the interior of $\omega$ but in the exterior of $\gamma,$ has vertex A on $\omega,$ and the line containing side $\overline{BC}$ is tangent to $\gamma.$ Segments $\overline{AO}$ and $\overline{BC}$ intersect at P, and $\dfrac{BP}{CP} = 3.$ Then AB can be written in the form $\dfrac{m}{\sqrt{n}} - \dfrac{p}{\sqrt{q}}$ for positive integers m, n, p, q with $\text{gcd}(m,n) = \text{gcd}(p,q) = 1.$ What is m+n+p+q?
$$\phantom{}$$

$\textbf{(A) } 42 \qquad \textbf{(B) }86 \qquad \textbf{(C) } 92 \qquad \textbf{(D) } 114 \qquad \textbf{(E) } 130$
## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
size(20cm); draw(circle((0,0), 20)); label("$\omega$", (0,0), 4.05*20*dir(149)*20/21); draw(circle((0,0), 17)); label("$\gamma$", (0,0), 4.05*17*dir(149)*20/21); dot((0,0)); label("$O$", (0,0), E); pair aa = (-20, 0); dot(aa); label("$A$", aa, W); draw((-20,0)--(0,0)); real a = (-20 + (80/sqrt(13) - 34/sqrt(3))*(sqrt(13)/sqrt(12))*(sqrt(3)/2)); real ans = (80/sqrt(13) - 34/sqrt(3)); dot((a,0)); label("$P$", (a, 0), dir(290)*0.58); pair s = ((12*a + 0)/13, 0-sqrt(12)*a/13); dot(s); label("$S$", s, dir(135)); pair c = (a + 1/4*ans*1/sqrt(13), 0 + 1/4*ans*sqrt(12)/sqrt(13)); dot(c); label("$C$", c, dir(110)); pair m = (a - 1/4*ans*1/sqrt(13), 0 - 1/4*ans*sqrt(12)/sqrt(13)); dot(m); label("$M$", m, dir(285)); pair b = (a - 3/4*ans*1/sqrt(13), 0 - 3/4*ans*sqrt(12)/sqrt(13)); dot(b); label("$B$", b, S); draw(b--s); draw(s--(0,0)); draw(aa--b); draw(aa--c); draw(aa--m); markscalefactor=0.1; draw(rightanglemark(s,m,aa,3.4)); draw(rightanglemark((0,0),s,m,3.4));
```


Let S be the point of tangency between $\overline{BC}$ and $\gamma,$ and M be the midpoint of $\overline{BC}.$ Note that AM \perp BS and OS \perp BS. This implies that $\angle OAM$\cong $\angle AOS,$ and $\angle AMP$\cong $\angle OSP.$ Thus, $\triangle PMA \sim \triangle PSO.$

If we let s be the side length of $\triangle ABC,$ then it follows that AM = $\frac{\sqrt{3}}{2}$s and PM = $\frac{s}{4}.$ This implies that AP = $\frac{\sqrt{13}}{4}$s, so $\frac{AM}{AP} = \frac{2\sqrt{3}}{\sqrt{13}}.$ Furthermore, $\frac{AM + SO}{AO} = \frac{AM}{AP} (b$ecause $\triangle PMA \sim \triangle PSO)$ so this gives us the equation
$$\frac{\frac{\sqrt{3}}{2}s + 17}{20} = \frac{2\sqrt{3}}{\sqrt{13}}$$
to solve for the side length s, or AB. Thus,

$$
\frac{\sqrt{39}}{2}s + 17\sqrt{13} = 40\sqrt{3}
\frac{\sqrt{39}}{2}s = 40\sqrt{3} - 17\sqrt{13}
s = \frac{80}{\sqrt{13}} - \frac{34}{\sqrt{3}} = AB
$$

The problem asks for m + n + p + $q = 80 + 13 + 34 + 3 =\boxed{\textbf{(E) } 130}.$
## Video Solution
https://www.youtube.com/watch?v=2eASfdhEyUE

Video Solution by Richard Rusczyk -
https://www.youtube.com/watch?v=CaYgfNEUBwA&list=PLyhPcpM8aMvLgfgbaTLDaV_jRYfn1A-x_&index=2
- AMBRIGGS
## See Also
