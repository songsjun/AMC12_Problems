# 2003 AMC 12B Problem 14

> This problem is the same as [2003 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2003_AMC_12B_Problems) and [2003 AMC 10B #20](https://artofproblemsolving.com/wiki/index.php/2003_AMC_10B_Problems).
## Problem
In rectangle ABCD, AB=5 and BC=3. Points F and G are on $\overline{CD}$ so that DF=1 and GC=2. Lines AF and BG intersect at E. Find the area of $\triangle AEB.$

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(8mm); defaultpen(linewidth(.8pt)+fontsize(10pt)); dotfactor=0; pair A=(0,0), B=(5,0), C=(5,3), D=(0,3); pair F=(1,3), G=(3,3); pair E=(5/3,5); draw(A--B--C--D--cycle); draw(A--E); draw(B--E); pair[] ps={A,B,C,D,E,F,G}; dot(ps); label("$A$",A,SW); label("$B$",B,SE); label("$C$",C,NE); label("$D$",D,NW); label("$E$",E,N); label("$F$",F,SE); label("$G$",G,SW); label("$1$",midpoint(D--F),N); label("$2$",midpoint(G--C),N); label("$5$",midpoint(A--B),S); label("$3$",midpoint(A--D),W);
```

$\textbf{(A) } 10 \qquad\textbf{(B) } \frac{21}{2} \qquad\textbf{(C) } 12 \qquad\textbf{(D) } \frac{25}{2} \qquad\textbf{(E) } 15$
## Solution 1
$\triangle EFG \sim \triangle EAB$ because FG \parallel AB. The ratio of $\triangle EFG$ to $\triangle EAB$ is 2:5 since AB=5 and FG=2 from subtraction. If we let h be the height of $\triangle EAB,$


$$
\frac{2}{5} = \frac{h-3}{h}
2h = 5h-15
3h-15 = 0
3h = 15
h = 5
$$


The height is 5 so the area of $\triangle EAB$ is $\frac{1}{2}(5)(5) = \boxed{\textbf{(D)}\ \frac{25}{2}}.$
## Solution 2
We can look at this diagram as if it were a coordinate plane with point A being (0,0). This means that the equation of the line AE is $y=3x$ and the equation of the line EB is $y=\frac{-3}{2}x+\frac{15}{2}.$ From this we can set of the follow equation to find the x coordinate of point E:


$$
3x=\frac{-3}{2}x+\frac{15}{2}
6x=-3x+15
9x=15
x=\frac{5}{3}
$$


We can plug this into one of our original equations to find that the y coordinate is 5, meaning the area of $\triangle EAB$ is $\frac{1}{2}(5)(5) = \boxed{\textbf{(D)}\ \frac{25}{2}}$
## Solution 3
At points A and B, segment AE is 5 units from segment BE. At points F and G, the segments are 2 units from each other. This means that collectively, the two lines closed the distance between them by 3 units over a height of 3 units. Therefore, to close the next two units of distance, they will have to travel a height of 2 units.

Then calculate the area of trapezoid FGBA and triangle EGF separately and add them. The area of the trapezoid is $\frac$ {2+5}{2}$\cdot 3 = \frac$ {21}{2} and the area of the triangle is $\frac{1}{2}\cdot 2 \cdot 2 = 2. \frac{21}{2}+2=\boxed{\textbf{(D)}\ \frac{25}{2}}$
## Solution 4
Since $\Delta{ABE}\sim{\Delta{FGE}}$ then [AFGB]$\sim{[FXYG]},$ where X and Y are ponts on EF and EG respectivley which make the areas similar. This process can be done over and over again multiple times by the ratio of $\frac{FG}{AB}=\frac{2}{5},$ or something like this
[AEB]=[AFGB]+[FXYZ]+...[AEB]=[AFGB]+$\frac{2}{5}$[AFGB]+($\frac{2}{5})^2$[AFGB]+...we have to find the ratio of the areas when the sides have shrunk by length $\frac{2}{5}$l


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.6 cm); pair A, B, C, D, E, F, G; A = (0,0); B = (5,0); C = (5,3); D = (0,3); F = (1,3); G = (3,3); E = extension(A,F,B,G); draw(A--B--C--D--cycle); draw(A--E--B); label("$A$", A, SW); label("$B$", B, SE); label("$C$", C, NE); label("$D$", D, NW); label("$E$", E, N); label("$F$", F, SE); label("$G$", G, SW); label("$2/5$", (D + F)/2, N); label("$4/5$", (G + C)/2, N); label("$6/5$", (B + C)/2, dir(0)); label("$6/5$", (A + D)/2, W); label("$2$", (A + B)/2, S);
```


Let [AFGB]' be the area of the shape whose length is $\frac{2}{5}$l
[AFGB]'=[ADCB]-[ADF]-[BCG][AFGB]'=12/5-6/25-12/25[AFGB]'=42/25Now comparing the ratios of [AFGB]' to [AFGB] we get
$\frac{[AFGB]'}{[AFGB]}=\frac{42}{25}/\frac{21}{2}\implies \frac{[AFGB]'}{[AFGB]}=\frac{4}{25}$By applying an infinite summation
[AEB]=$\sum_{n=0}^{\infty} \frac{21}{2}\cdot{(\frac{4}{25})^n}S=\frac{a_1}{1-r}\boxed{[AEB]=\frac{25}{2}}$
## Solution 5
Drop a perpendicular from E to AB and call the intersection point X. $\triangle EXA$ and $\triangle DFA$ are similar and so are $\triangle BCG$ and $\triangle EXB ($You can prove this with AA by observing that $\angle DFA$ is congruent to $\angle EAB$ and so on). This means that $\dfrac{AX}{BX}=\dfrac{1}{2}$ so AX=$\dfrac{5}{3}. \dfrac{EX}{AX}=3,$ which means that EX=5. Then, [AEB]=$\dfrac{5\cdot 5}{2}=\boxed{\textbf{(D) } \dfrac{25}{2}}.$
## See Also
