# 2025 AMC 12B Problem 21

## Problem
Two non-congruent triangles have the same area. Each triangle has sides of length 8 and 9, and the third side of each triangle has integer length. What is the sum of the lengths of the third sides?

$\textbf{(A) } 20 \qquad \textbf{(B) } 22 \qquad \textbf{(C) } 24 \qquad \textbf{(D) } 26 \qquad \textbf{(E) } 28$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
size(250); pair A = (0,0); pair C1 = (-9,0); pair C2 = (9,0); pair B = (-4.0/3.0, 4*sqrt(35)/3); pen pen1 = blue+1.2; pen pen2 = red+1.2; draw(B--A--C1--cycle, pen1); draw(B--A--C2--cycle, pen2); dot("$A$", A, S); dot("$C_1$", C1, SW); dot("$C_2$", C2, SE); dot("$B$", B, N); label("$8$", (A+B)/2, W); label("$9$", (A+C1)/2, S); label("$9$", (A+C2)/2, S);
```


*~Diagram by imosilver*

Let the angles between the 8 and 9 sides be $\theta_1$ and $\theta_2.$ Relating the two triangles' areas, we get

$$
\frac{1}{2} \cdot 8 \cdot 9 \cdot \sin{\theta_1} = \frac{1}{2} \cdot 8 \cdot 9 \cdot \sin{\theta_2}
\sin{\theta_1} = \sin{\theta_2}
$$

For this to be true, $\theta_1 + \theta_2 = 180.$
We will now apply Law of Cosines to get an expression for $s_1$ and $s_2$ in terms of $\theta_1$ and $\theta_2.$

$$
s_1^2 = 8^2 + 9^2 - (2)(8)(9)\cos(\theta_1)
s_2^2 = 8^2 + 9^2 - (2)(8)(9)\cos(180-\theta_1).
$$

Noting that $\cos{\theta_1} = -\cos{(180 - \theta_1)},$ we can add the two equations to get that
$$s_1^2 + s_2^2 = 290.$$
We now need two perfect squares that add to 290. After some analysis, we find $121 + 169 = 290$. Therefore, $s_1 = 11$ and $s_2 = 13$, so our answer is 11 + $13 =\boxed{24}.$
Note that the $\cos{\theta_1} = 1/6$.  Also, note that $289 + 1 = 290$, but 17 and 1 are not valid side lengths due to the Triangle Inequality.

*~lprado*
## Solution 2 (Heron)
Let the third sides be a and b. Say the third sides is x, where x is a dummy variable. Then, by Heron’s Formula, the area of the triangle is

$$\sqrt{\frac{x+17}{2}\cdot\frac{x+1}{2}\cdot\frac{x-1}{2}\cdot\frac{17-x}{2}}=\frac{1}{4}\sqrt{(17^2-x^2)(x^2-1^2)}$$

Since the areas are the same, this value when x=a is the same as this value when x=b. In other words,
$$\frac{1}{4}\sqrt{(17^2-a^2)(a^2-1^2)}=\frac{1}{4}\sqrt{(17^2-b^2)(b^2-1^2)}$$
equivalent to
$$(289-a^2)(a^2-1)=(289-b^2)(b^2-1)=c$$
for some constant c.

But if we consider the quadratic
$$(289-y)(y-1)=c$$
we know that the two roots must be $y=a^2$ and y=b^2. Expanding the quadratic, we get
$$y^2-290y+289+c=0$$
By Vieta’s Formulas, we must have a^2+b^2=290. Casework yields $a=11,b=13$ (or vice versa) as the only solutions, so the sum is $a+b=\boxed{\textbf{(C) } 24}.$

~ [https://artofproblemsolving.com/wiki/index.php/User:Eevee9406 eevee9406]
## Solution 3 (Slight difference to Solution 1)
Denote the angle that is between side lengths 8 and 9 as angle A, the other triangle will be $180^\circ - A,$ because by the area formula of $\frac{1}{2}a\cdotb\cdot\sin C,$ the $\sin C$ needs to remain constant while a and b stay the same to keep the area the same. Denote the shorter third side as x and longer third side as y.

By applying the Law of Cosines, y^2 = 8^2 + 9^2 - 2 $\cdot 8 \cdot 9 \cdot \cos(180- A),$ which gives $y^2 = 145 +144\cos A.$ Similarly, x^2 = 145 - $144\cos A.$ Since the question says the third lengths are both integers, try testing values of $\cos A.$ Notice when $\cos A = \frac{1}{6},y^2 = 169$ and $x^2 = 121,$ giving the lengths as 13 and 11 respectively. The required answer is then 13 + 11 = $\boxed{\textbf{(C) } 24}.$

*~Mitsuihisashi14*

~ $\LaTeX$ by [https://artofproblemsolving.com/wiki/index.php/User:Eevee9406 eevee9406]
## Solution 4 (Sine/Cosine Law + Quadratic Residues)
As in other solutions, use sine law to check $\beta=180-\alpha, \cos\alpha=-\cos\beta.$ Apply cosine law $x^2,y^2=8^2+9^2\mp 2(8)(9)\cos\alpha=145\mp 144\cos\alpha$ and and verify integer solutions to $x^2+y^2=2(8^2+9^2)=290$.

Since $\alpha>0,$ we need $\cos\alpha<1$ so $(1,289)=(1^2,17^2)$ is not valid. WLOG $2\le$ x. To help with the bash, note the quadratic residues mod 3 and 4 are 0,1, so it must be $1+1\equiv 2,$ so we only need to check odd cases not divisible by 3, so $x=5,7,11,13. 290-25=265$ bad $290-49=241$ bad $290-121=169$ good, stop by symmetry. So (x,y)=(11,13), giving $x+y=11+13=\boxed{\textbf{(C) } 24}.$ ~imosilver
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=w5t9UArrJj0
## Video Solution 2 by OmegaLearn.org
https://youtu.be/ziQ53FFpE_M
## See Also
