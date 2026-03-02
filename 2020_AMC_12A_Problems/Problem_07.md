# 2020 AMC 12A Problem 7

> This problem is the same as [2020 AMC 12A #7](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #10](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
Seven cubes, whose volumes are $1$, $8$, $27$, $64$, $125$, $216$, and $343$ cubic units, are stacked vertically to form a tower in which the volumes of the cubes decrease from bottom to top. Except for the bottom cube, the bottom face of each cube lies completely on top of the cube below it. What is the total surface area of the tower (including the bottom) in square units?

$\textbf{(A)}\ 644\qquad\textbf{(B)}\ 658\qquad\textbf{(C)}\ 664\qquad\textbf{(D)}\ 720\qquad\textbf{(E)}\ 749$
## Solution 1
The volume of each cube follows the pattern of $n^3$, for $n$ is between $1$ and $7$.

We see that the total surface area can be comprised of three parts: the sides of the cubes, the tops of the cubes, and the bottom of the $\times 7\times 7$ cube (which is just $7 \times 7 = 49$). The sides areas can be measured as the sum $\sum_{n=1}^{7} n^2$, giving us $560$. Structurally, if we examine the tower from the top, we see that it really just forms a $\times 7$ square of area $49$. Therefore, we can say that the total surface area is $560 + 49 + 49 = \boxed{\textbf{(B) }658}$.
Alternatively, for the area of the tops, we could have found the sum $\sum_{n=2}^{7}((n)^{2}-(n-1)^{2})$, giving us $49$ as well.

*~ciceronii*

Note: The area on top and bottom are 49 because the largest area is 49, and the other cubes are "inscribed" in it.
## Solution 2
It can quickly be seen that the side lengths of the cubes are the integers from 1 to 7 inclusive.

First, we will calculate the total surface area of the cubes, ignoring overlap. This value is $6 ( 1^2 + 2^2 + \cdots + 7^2 ) = 6\sum_{n=1}^{7} n^2 = 6 \left( \frac{7(7 + 1)(2 \cdot 7 + 1)}{6} \right) = 7 \cdot 8 \cdot 15 = 840$. Then, we need to subtract out the overlapped parts of the cubes. Between each consecutive pair of cubes, one of the smaller cube's faces is completely covered, along with an equal area of one of the larger cube's faces. The total area of the overlapped parts of the cubes is thus equal to $\sum_{n=1}^{6} n^2 = 182$. Subtracting the overlapped surface area from the total surface area, we get $840 - 182 = \boxed{\textbf{(B) }658}$. ~emerald_block
## Solution 3 (a bit more tedious than other solutions)
It can be seen that the side lengths of the cubes using cube roots are all integers from $1$ to $7$, inclusive.

Only the cubes with side length $1$ and $7$ have $5$ faces in the surface area and the rest have $4$. Also, since the cubes are stacked, we have to find the difference between each $n^2$ and $(n-1)^2$ side length as $n$ ranges from $7$ to $2$.

We then come up with this: $5(49)+13+4(36)+11+4(25)+9+4(16)+7+4(9)+5+4(4)+3+5(1)$.

We then add all of this and get $\boxed{\textbf{(B) }658}$.

*~aryam, edited by taarunganesh*
## Solution 4
Notice that the surface area of the top cube is $6s^2$ and the others are $4s^2$. Then we can directly compute. The edge length for the first cube is $7$ and has a surface area of $294$. The surface area of the next cube is $144$. The surface area of the next cube $100$. The surface area of the next cube is $64$. The surface area of the next cube is $36$. The surface area of the next cube is $16$. The surface area of the next cube is $4$. We then sum up $294+144+100+64+36+16+4$ to get $\boxed{\textbf{(B) }658}$.
*~smartatmath*
## Solution 5
First of all, compute the area of the sides, excluding the top and bottoms, of the cubes. The side lengths (cube root the volumes) are 1, 2, 3, 4, 5, 6, 7.
Each cube's area of the sides can be calculated with $4$(area of one side)$=4(l^2)$ so in total that is $4(1+4+16+...+49)$
so
$4(140)=560$
the area of all the sides of the cubes is $560$.
Then, calculate the bottom face of the largest cube, $7*7=49$.
Now, notice that if you stack the cubes up on top of each other, and look directly down on them, the tops of the cubes showing add up to the area of the bottom cube, the 7x7. Therefore, the sum of the area of the tops of the cubes is $7*7=49$.

Now add them all up: $49+49+560=658.$ Therefore, the answer is $\boxed{\textbf{(B) }658}$.

*~Hermanboxcar5*
## Solution 6 (Similar to Solution 2, without notation)
Firstly, calculate the total surface area for all the cubes. Knowing that the area of each square of each cube are $2^2,3^2,4^2,5^2,6^2,7^2,$ we have $6(1+4+9+16+25+36+49)=6(140)=840.$ When you stack these cubes, the top square of each are subtracted by the square area of the cube above it. Meanwhile, the bottom square of each (except the 7x7x7 cube) won't be counted because of the stacking. So, we have to subtract $2(1+4+9+16+25+36)=2(91)=182$ from $840$, getting $\boxed{\textbf{(B) }658}.$

*~Yelechi*
## Solution 7 (Going from Bottom to Top)
The surface area of the bottom cube is the bottom face, the 4 side faces, and the top face minus the bottom face of the next cube. Therefore, the surface area of the bottom cube is 6 faces minus the bottom face of the next cube. That will be $6 \cdot 49-36$. For the next cube, we take the 4 side faces and the top face, and subtract the bottom face of the next cube. Therefore, the surface area of the next cube will be 5 of its faces minus the bottom face of the next cube. That will be $5 \cdot 36-25$. We can do the next cube the same way. It will end up  as $5 \cdot 25-16$. From here we start noticing a pattern. The next will be $5 \cdot 16-9$, and then $5 \cdot 9-4$, next $5 \cdot 4-1$, and to include the top cube, we have to add $5 \cdot 1$, which is basically $5 \cdot 1-0$. Now, putting it all together, we get $6 \cdot 49-36+5 \cdot 36-25+5 \cdot 25-16+5 \cdot 16-9+5 \cdot 9-4+5 \cdot 4-1+5 \cdot 1-0=6 \cdot 49+5(36+25+16+9+4+1)-(36+25+16+9+4+1)=6 \cdot 49+4(36+25+16+9+4+1)=294+4(91)=294+364=\boxed{\textbf{(B) }658}$.

*~NXC*
## Video Solution 1
Education, The Study of Everything

https://youtu.be/tIubHgoWW_M
## Video Solution 2
https://youtu.be/JEjib74EmiY

*~IceMatrix*
## Video Solution 3
https://youtu.be/ZZB8KiqHbD4

*~savannahsolver*
## Video Solution by OmegaLearn
https://youtu.be/FDgcLW4frg8?t=3319

*~pi_is_3.14*
## See Also
