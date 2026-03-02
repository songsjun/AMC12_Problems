# 2016 AMC 12A Problem 12

## Problem 12
In $\triangle ABC, AB = 6, BC = 7,$ and CA = 8. Point D lies on $\overline{BC},$ and $\overline{AD}$ bisects $\angle BAC.$ Point E lies on $\overline{AC},$ and $\overline{BE}$ bisects $\angle ABC.$ The bisectors intersect at F. What is the ratio AF : FD?


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A = (0,0), B=(6,0), C=intersectionpoints(Circle(A,8),Circle(B,7))[0], F=incenter(A,B,C), D=extension(A,F,B,C),E=extension(B,F,A,C); draw(A--B--C--A--D^^B--E); label("$A$",A,SW); label("$B$",B,SE); label("$C$",C,N); label("$D$",D,NE); label("$E$",E,NW); label("$F$",F,1.5*N);
```


$\textbf{(A)}\ 3:2\qquad\textbf{(B)}\ 5:3\qquad\textbf{(C)}\ 2:1\qquad\textbf{(D)}\ 7:3\qquad\textbf{(E)}\ 5:2$
## Solution 1
By the angle bisector theorem, $\frac{AB}{AE} = \frac{CB}{CE}$

$$\frac{6}{AE} = \frac{7}{8 - AE} so AE = \frac{48}{13}$$

Similarly, CD = 4.

There are two ways to solve from here.
First way:

Note that DB = $7 - 4 = 3$. By the angle bisector theorem on $\triangle ADB, \frac{AF}{FD} = \frac{AB}{DB} = \frac{6}{3}.$ Thus the answer is $\boxed{\textbf{(C)}\; 2 : 1}$

Second way:

Now, we use [mass points](https://artofproblemsolving.com/wiki/index.php/mass_points). Assign point C a mass of 1.

$$mC \cdot CD = mB \cdot DB , so mB = \frac{4}{3}$$

Similarly, A will have a mass of $\frac{7}{6}$

$$mD = mC + mB = 1 + \frac{4}{3} = \frac{7}{3}$$

$$So \frac{AF}{FD} = \frac{mD}{mA} = \boxed{\textbf{(C)}\; 2 : 1}$$
## Solution 2
Denote [$\triangle{ABC}$] as the area of triangle ABC and let r be the inradius. Also, as above, use the angle bisector theorem to find that BD = 3. There are two ways to continue from here:

1. Note that F is the incenter. Then, $\frac{AF}{FD} = \frac{[\triangle{AFB}]}{[\triangle{BFD}]} = \frac{AB * \frac{r}{2}}{BD * \frac{r}{2}} = \frac{AB}{BD} = \boxed{\textbf{(C)}\; 2 : 1}$

2. Apply the angle bisector theorem on $\triangle{ABD}$ to get $\frac{AF}{FD} = \frac{AB}{BD} = \frac{6}{3} = \boxed{\textbf{(C)}\; 2 : 1}$
## Solution 3
Draw the third angle bisector, and denote the point where this bisector intersects AB as P. Using angle bisector theorem, we see AE=48/13 , EC=56/13, AP=16/5, PB=14/5. Applying [https://artofproblemsolving.com/wiki/index.php/Van_Aubel%27s_Theorem Van Aubel's Theorem], AF/FD=(48/13)/(56/13) + (16/5)/(14/5)=(6/7)+(8/7)=$14/7=2/1$, and so the answer is $\boxed{\textbf{(C)}\; 2 : 1}.$
## Solution 4
One only needs the angle bisector theorem to solve this question.

The question asks for AF:FD = $\frac{AF}{FD}.$ Apply the angle bisector theorem to $\triangle ABD$ to get
$$\frac{AF}{FD} = \frac{AB}{BD}.$$

AB = 6 is given. To find BD, apply the angle bisector theorem to $\triangle BAC$ to get
$$\frac{BD}{DC} = \frac{BA}{AC} = \frac{6}{8} = \frac{3}{4}.$$

Since
$$BD + DC = BC = 7,$$
it is immediately obvious that BD = 3, DC = 4 satisfies both equations.

Thus,
$$AF:FD = AB:BD = 6:3 = \boxed{\textbf{(C)}\ 2:1}.$$
*~revision by emerald_block*
## Solution 5 (Luck-Based)
Note that AF and BD look like medians. Assuming they are medians, we mark the answer $\boxed{\textbf{(C)}\ 2:1}$ as we know that the centroid (the point where all medians in a triangle are concurrent) splits a median in a 2:1 ratio, with the shorter part being closer to the side it bisects.
*~scthecool*
Note: This is heavily luck based, and if the figure had not been drawn to scale, this answer would have been wrong. It is advised to not use this in a real competition unless absolutely necessary.
## Solution 6 (Cheese)
Assume the drawing is to-scale. Use your allotted ruler to measure out each side. Note that AB:BC:AC is equal to 6:7:8.

Measure out the length of $\overline{AF}$ in relation to $\overline{FD}.$ This ratio is approximately $\boxed{\textbf{(C)}\ 2:1}.$ Solution by juwushu.
## Video Solution by OmegaLearn
https://youtu.be/Gjt25jRiFns?t=43

*~pi_is_3.14*
## See Also
